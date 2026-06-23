"""
Simple test script to POST a URL to the metadata endpoint.
Run after starting Django dev server (`python manage.py runserver`).
"""
import requests
import json

API = "http://127.0.0.1:8000/api/metadata/metadata/"

def test(url):
    resp = requests.post(API, json={"url": url}, timeout=15)
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print('Non-JSON response:', resp.text)

if __name__ == '__main__':
    # change this URL to test different sites
    test('example.com')
