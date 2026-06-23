# Metadata fetch API

This small app adds a POST endpoint to fetch page metadata, SSL and WHOIS information.

Endpoint (POST):

- /api/metadata/metadata/ (JSON body: { "url": "example.com" })

Quick test (PowerShell):

```powershell
.venv\Scripts\Activate
python manage.py runserver 127.0.0.1:8000
# in another shell
python scripts\test_metadata.py
```

Notes:

- Requires packages: requests, beautifulsoup4, python-whois (whois), and django-rest-framework.
- WHOIS lookups can be slow and sometimes blocked; consider caching or an external WHOIS API for production.
