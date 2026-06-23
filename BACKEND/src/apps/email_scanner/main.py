import os
import uuid
import json
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Body, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
# Add your Supabase and ClamAV imports here

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET")
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define your Email and ScanRecord models here (SQLAlchemy ORM)
# ...

# Utility functions: parse_email, extract_urls, url_reputation, pii_scan, aggregate_results, save_raw_to_supabase
# ...

# ---------------- SCAN TASK ----------------

async def run_scan(email_id: str):
    session = SessionLocal()
    try:
        email_row = session.query(Email).filter(Email.id == email_id).first()
        if not email_row: return
        res = supabase.storage.from_(SUPABASE_BUCKET).download(email_row.raw_path)
        raw = res.read()
        msg = parse_email(raw)
        text = msg.get_body(preferencelist=('plain', 'html')).get_content() if msg else ""
        urls = extract_urls(text)
        scans = [url_reputation(urls), pii_scan(text)]
        agg = aggregate_results(scans)
        email_row.risk_score = agg['score']
        email_row.verdict = agg['verdict']
        session.add(email_row)
        for s in scans:
            record = ScanRecord(id=str(uuid.uuid4()), email_id=email_id, scanner=s['scanner'], result=s['result'], details=json.dumps(s['details']))
            session.add(record)
        session.commit()
    finally:
        session.close()

# ---------------- API ----------------

app = FastAPI(title="Email Scanning Backend (Supabase)")

class IngestResponse(BaseModel):
    email_id: str
    message: str

@app.post("/ingest", response_model=IngestResponse)
async def ingest(background: BackgroundTasks, email_file: Optional[UploadFile] = File(None), raw_body: Optional[bytes] = Body(None)):
    if not email_file and not raw_body:
        raise HTTPException(400, "Provide email as file or raw body.")
    raw = await email_file.read() if email_file else raw_body
    path = save_raw_to_supabase(raw)
    msg = parse_email(raw)
    eid = str(uuid.uuid4())
    email = Email(
        id=eid,
        sender=msg.get('From'),
        recipients=msg.get('To'),
        subject=msg.get('Subject'),
        raw_path=path,
        verdict='processing',
        metadata=json.dumps({'ingested': datetime.utcnow().isoformat()})
    )
    s = SessionLocal()
    s.add(email)
    s.commit()
    s.close()
    background.add_task(run_scan, eid)
    return IngestResponse(email_id=eid, message="Email accepted for scanning.")

@app.get("/emails")
def list_emails():
    s = SessionLocal()
    rows = s.query(Email).order_by(Email.received_at.desc()).all()
    out = [{"id": e.id, "sender": e.sender, "subject": e.subject, "verdict": e.verdict, "score": e.risk_score} for e in rows]
    s.close()
    return out

@app.get("/emails/{eid}")
def get_email(eid: str):
    s = SessionLocal()
    e = s.query(Email).filter(Email.id == eid).first()
    if not e: raise HTTPException(404, "Not found")
    scans = [{"scanner": sc.scanner, "result": sc.result, "details": json.loads(sc.details)} for sc in e.scans]
    return {"id": e.id, "sender": e.sender, "subject": e.subject, "verdict": e.verdict, "score": e.risk_score, "scans": scans}

@app.get("/health")
def health():
    return {"status": "ok", "db": True, "storage": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("email_scanner_backend.main:app", host="0.0.0.0", port=8000, reload=True)
