# Zentrya - Cybersecurity Toolkit

A full-stack cybersecurity platform with URL phishing detection, email spam scanning, website metadata fetching, malicious site takedown requests, and a Chrome extension for real-time browsing protection.


<img width="1893" height="859" alt="Screenshot 2026-07-08 160729" src="https://github.com/user-attachments/assets/8da02b40-b613-4c05-92d4-b13965860b4f" />


## Project Structure

```
BE/
├── BACKEND/          # Django REST API
│   ├── src/          # Django source code
│   ├── ml_models/    # ML model files (.pkl, .joblib)
│   ├── venv/         # Python virtual environment
│   └── requirements.txt
├── FRONTEND/         # React + Vite + Tailwind
│   ├── src/
│   └── package.json
└── EXTENSION/        # Chrome Extension
    ├── manifest.json
    ├── popup.html/js/css
    ├── background.js
    └── content.js
```

## Features

### User Features
- **URL Scanner** - Scan URLs for phishing using ML model
- **Email Scanner** - Detect spam/phishing in email content
- **Gmail Integration** - Connect Gmail to scan inbox senders
- **Metadata Fetcher** - Get SSL, WHOIS, DNS, and security headers for any domain
- **Takedown Requests** - Report malicious websites for removal
- **Community Q&A** - Ask and answer cybersecurity questions
- **Glossary** - 27+ cybersecurity terms with explanations
- **SecBot Chatbot** - AI-powered cybersecurity assistant

### Admin Features
- **Admin Dashboard** - Overview stats, pending requests
- **Takedown Management** - Approve/reject requests, send abuse emails
- **User Management** - View users, change roles, disable accounts
- **Scan Logs** - Monitor all scan activity across the platform

### Chrome Extension
- **Auto-Protect Mode** - Automatically scan all links on every page
- **Phishing Link Highlighting** - Red border + warning on dangerous links
- **URL Scanner** - Scan any URL from the browser
- **Email Scanner** - Check email content for spam
- **Metadata Fetcher** - Quick website security info

---

## Prerequisites

- **Python 3.12+**
- **Node.js 18+**
- **npm**
- **Google Chrome** (for extension)
- **Supabase account** (for authentication)
- **Google Cloud Console project** (for Gmail OAuth - optional)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CyberSecurity-Toolkit.git
cd zentrya
```

### 2. Backend Setup

```bash
cd BACKEND

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download NLTK data (required for spam detection)
python -c "import nltk; nltk.download('stopwords')"
```

#### ML Models

The ML model files (`.pkl`, `.joblib`) are required but not included in the repo due to size. Place the following files in `BACKEND/ml_models/`:

| File | Used By |
|------|---------|
| `phishing_url_model.pkl` | URL Scanner |
| `spam_classifier_model.joblib` | Email/Spam Scanner |
| `tfidf_vectorizer.joblib` | Email/Spam Scanner |
| `sender_email_model.pkl` | Gmail Sender Analysis |
| `lgbm_phishing_model.joblib` | Phishing Detection |
| `scaler_for_phishing.joblib` | Phishing Detection |

#### Environment Variables

Create a `.env` file in `BACKEND/` or set these environment variables:

```bash
SECRET_KEY=your-django-secret-key
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key          # For chatbot (optional)
GOOGLE_CLIENT_ID=your-google-client-id      # For Gmail integration (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google/oauth2/callback
```

#### Run Backend

```bash
cd src

# Run migrations
python manage.py migrate

# Create superuser (optional, for Django admin)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend runs at **http://localhost:8000**

---

### 3. Frontend Setup

```bash
cd FRONTEND

# Install dependencies
npm install
```

#### Environment Variables

Create a `.env` file in `FRONTEND/`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://127.0.0.1:8000
```

#### Run Frontend

```bash
npm run dev
```

Frontend runs at **http://localhost:5173**

---

### 4. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text not null default 'user' check (role in ('user', 'admin', 'disabled')),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile on signup
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Admins can read all profiles
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update all profiles
create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

3. To make yourself an admin:

```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

---

### 5. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the `EXTENSION/` folder
5. The Zentrya icon appears in your toolbar

> **Note:** The backend must be running at `localhost:8000` for the extension to work.

---

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/phishing/predict/` | Scan URL for phishing |
| POST | `/api/spam/predict/` | Scan email for spam |
| POST | `/api/metadata/metadata/` | Fetch website metadata |
| POST | `/api/chat/` | Chat with SecBot |
| GET | `/api/community/questions/` | List community questions |
| POST | `/api/community/questions/` | Post a question |
| POST | `/api/community/answers/` | Post an answer |

### Takedown
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/takedown/request/` | Submit takedown request |
| GET | `/api/takedown/list/` | List all requests |
| GET | `/api/takedown/{id}/` | Get request details |
| POST | `/api/takedown/{id}/approve/` | Approve request |
| POST | `/api/takedown/{id}/reject/` | Reject request |
| POST | `/api/takedown/{id}/send-email/` | Send abuse email |
| POST | `/api/takedown/{id}/resolve/` | Mark as resolved |

### Scan Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scans/list/` | List scan logs |
| GET | `/api/scans/stats/` | Get scan statistics |

### Gmail
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/google/oauth2/start/` | Start Gmail OAuth |
| GET | `/api/google/oauth2/callback` | OAuth callback |
| GET | `/api/google/scan/` | Scan Gmail senders |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Django 5.2, Django REST Framework |
| Database | SQLite (dev), PostgreSQL (prod) |
| Auth | Supabase Auth |
| ML Models | scikit-learn, LightGBM, NLTK |
| Chatbot | Google Gemini API |
| Extension | Chrome Manifest V3 |

---

## Running Both Servers

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd BACKEND
venv\Scripts\activate       # Windows
$env:DEBUG = "True"         # PowerShell
python src/manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd FRONTEND
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## License

This project is for educational purposes.
