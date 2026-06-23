import math
import re
from pathlib import Path

import joblib
import pandas as pd
from django.conf import settings


# Path to the trained sender email model
MODEL_PATH = Path(settings.BASE_DIR).parent / "ml_models" / "sender_email_model.pkl"

_model = None


def _get_model():
    """Lazily load and cache the trained sender email model."""
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


# -----------------------------
# Lists used in features
# -----------------------------

suspicious_tlds = [
    "xyz",
    "ru",
    "tk",
    "top",
    "work",
    "club",
    "click",
    "gq",
    "ml",
    "cf",
    "ga",
    "buzz",
]

free_providers = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "protonmail.com",
    "aol.com",
]

trusted_domains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
]

brands = [
    "paypal",
    "amazon",
    "microsoft",
    "google",
    "apple",
    "facebook",
    "instagram",
    "bank",
]


# -----------------------------
# Feature functions
# -----------------------------


def extract_domain(email: str) -> str:
    if "@" not in email:
        return ""
    return email.split("@")[1].lower()


def digit_count(text: str) -> int:
    return sum(c.isdigit() for c in text)


def special_char_count(text: str) -> int:
    return len(re.findall(r"[-_.]", text))


def suspicious_tld(domain: str) -> int:
    try:
        tld = domain.split(".")[-1]
        return 1 if tld in suspicious_tlds else 0
    except Exception:
        return 0


def hyphen_count(domain: str) -> int:
    return domain.count("-")


def digit_ratio(text: str) -> float:
    digits = sum(c.isdigit() for c in text)
    if len(text) == 0:
        return 0.0
    return digits / len(text)


def domain_entropy(domain: str) -> float:
    if len(domain) == 0:
        return 0.0
    prob = [float(domain.count(c)) / len(domain) for c in dict.fromkeys(domain)]
    entropy = -sum([p * math.log2(p) for p in prob])
    return entropy


def free_email_provider(domain: str) -> int:
    # treat free providers as neutral
    if domain in free_providers:
        return 0
    return 1


def brand_similarity(domain: str) -> int:
    for brand in brands:
        if brand in domain:
            return 1
    return 0


# -----------------------------
# Feature extractor
# -----------------------------

feature_names = [
    "sender_length",
    "digit_count",
    "special_char_count",
    "domain_length",
    "subdomain_depth",
    "suspicious_tld",
    "hyphen_count",
    "digit_ratio",
    "domain_entropy",
    "free_email_provider",
    "brand_similarity",
]


def extract_features(email: str) -> list[float]:
    domain = extract_domain(email)
    return [
        len(email),
        digit_count(email),
        special_char_count(email),
        len(domain),
        domain.count("."),
        suspicious_tld(domain),
        hyphen_count(domain),
        digit_ratio(email),
        domain_entropy(domain),
        free_email_provider(domain),
        brand_similarity(domain),
    ]


# -----------------------------
# Prediction function
# -----------------------------


def predict_sender(email: str) -> dict:
    """Predict whether a sender email address is safe or risky.

    Returns a dict with keys:
    - email
    - phishing_probability (float between 0 and 1)
    - verdict (human-readable string)
    """

    domain = extract_domain(email)

    if domain == "":
        return {
            "email": email,
            "phishing_probability": 1.0,
            "verdict": "❌ Invalid Email",
        }

    # whitelist trusted providers
    if domain in trusted_domains:
        return {
            "email": email,
            "phishing_probability": 0.0,
            "verdict": "✅ Trusted Email Provider",
        }

    values = extract_features(email)
    df = pd.DataFrame([values], columns=feature_names)

    model = _get_model()
    probability = float(model.predict_proba(df)[0][1])

    if probability > 0.9:
        verdict = "🚨 High Risk Sender"
    elif probability > 0.6:
        verdict = "⚠️ Suspicious Sender"
    else:
        verdict = "✅ Safe Sender"

    return {
        "email": email,
        "phishing_probability": probability,
        "verdict": verdict,
    }
