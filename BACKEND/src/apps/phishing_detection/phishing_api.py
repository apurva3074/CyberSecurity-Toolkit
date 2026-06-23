from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.scan_logs.utils import log_scan
import joblib
import os
from django.conf import settings
import re
from urllib.parse import urlparse
import pandas as pd
import tldextract
import requests

# Load new model
MODEL_PATH = os.path.join(settings.BASE_DIR, '..', 'ml_models', 'phishing_url_model.pkl')
model = joblib.load(MODEL_PATH)

def check_url_exists(url):
    """Check if a URL exists and is reachable"""
    try:
        # Ensure URL has a scheme
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Parse to validate URL structure
        parsed = urlparse(url)
        if not parsed.netloc:
            return False, "Invalid URL format"
        
        # Try to reach the URL with a timeout
        response = requests.head(url, timeout=5, allow_redirects=True)
        
        # If HEAD fails, try GET with a very short timeout
        if response.status_code >= 400:
            response = requests.get(url, timeout=5, allow_redirects=True, stream=True)
        
        return response.status_code < 400, None
    except requests.exceptions.ConnectionError:
        return False, "URL does not exist or is unreachable"
    except requests.exceptions.Timeout:
        return False, "URL request timed out"
    except requests.exceptions.RequestException as e:
        return False, f"Error checking URL: {str(e)}"

def extract_features(url):
    features = {}
    parsed = urlparse(url)
    ext = tldextract.extract(url)
    features['url_length'] = len(url)
    features['num_digits'] = sum(c.isdigit() for c in url)
    features['num_letters'] = sum(c.isalpha() for c in url)
    features['num_special_chars'] = len(re.findall(r'[@_\-!#$%^&*()<>?/\|}{~:]', url))
    features['domain_length'] = len(ext.domain)
    features['num_dots'] = url.count('.')
    features['num_subdirs'] = url.count('/')
    features['has_ip'] = 1 if re.match(r'(\d{1,3}\.){3}\d{1,3}', parsed.netloc) else 0
    features['has_at'] = 1 if "@" in url else 0
    features['https'] = 1 if parsed.scheme == "https" else 0
    features['prefix_suffix'] = 1 if "-" in parsed.netloc else 0
    return pd.DataFrame([features])

def preprocess_url(url):
    df = extract_features(url)
    return df

class PhishingPredictView(APIView):
    # Allow unauthenticated requests from the Chrome extension and other clients.
    # We don't use session auth here, so CSRF checks are not applied.
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        url = request.data.get('url')
        if not url:
            return Response({'error': 'No URL provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if URL exists, but do not treat unreachable as a hard error.
        # The model only uses the URL string, so we can still classify it.
        exists, error_msg = check_url_exists(url)

        try:
            features = preprocess_url(url)
            prediction = model.predict(features)[0]
            is_phishing = bool(prediction)
            log_scan('url', url, result='phishing' if is_phishing else 'safe', is_threat=is_phishing, request=request)
            return Response({
                'url_exists': bool(exists),
                'phishing': is_phishing,
                'warning': error_msg if not exists else None,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
