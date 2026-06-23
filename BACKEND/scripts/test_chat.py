import requests
import json

API = 'http://127.0.0.1:8000/api/chat/'

def test(msg):
    resp = requests.post(API, json={'message': msg}, timeout=20)
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print('Non-JSON response:', resp.text)

if __name__ == '__main__':
    test('Explain CSRF in simple terms.')
