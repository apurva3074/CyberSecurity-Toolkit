# Chatbot setup

This app exposes a POST endpoint at `/api/chat/` backed by the Mistral API.

Important: never store your API key in source control. Use environment variables.

PowerShell quick start:

```powershell
# set the key for the current session
$env:MISTRAL_API_KEY = "YOUR_REAL_KEY"

# start server
.venv\Scripts\Activate
python manage.py runserver 127.0.0.1:8000
```

Test with `scripts/test_chat.py` or Postman (POST JSON { "message": "..." } to http://127.0.0.1:8000/api/chat/).
