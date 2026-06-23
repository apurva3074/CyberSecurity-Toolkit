from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import joblib
import os
import re
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import nltk
import json
from apps.scan_logs.utils import log_scan

# Ensure NLTK stopwords are downloaded
try:
    stop_words = set(stopwords.words('english'))
except LookupError:
    nltk.download('stopwords')
    stop_words = set(stopwords.words('english'))

ps = PorterStemmer()

# Load model and vectorizer once at module load
ml_models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '..', 'ml_models')
MODEL_PATH = os.path.join(ml_models_dir, 'spam_classifier_model.joblib')
VECTORIZER_PATH = os.path.join(ml_models_dir, 'tfidf_vectorizer.joblib')

model = joblib.load(MODEL_PATH)
tfidf = joblib.load(VECTORIZER_PATH)

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z]', ' ', text)
    words = text.split()
    words = [ps.stem(word) for word in words if word not in stop_words]
    return ' '.join(words)

@csrf_exempt
def predict_spam(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required.'}, status=405)
    try:
        data = json.loads(request.body)
        message = data.get('message', '')
        if not message:
            return JsonResponse({'error': 'No message provided.'}, status=400)
        cleaned = preprocess_text(message)
        vector = tfidf.transform([cleaned]).toarray()
        prediction = model.predict(vector)[0]
        result = 'spam' if prediction == 1 else 'ham'
        log_scan('spam', message[:200], result=result, is_threat=(result == 'spam'), request=request)
        return JsonResponse({'prediction': result})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
