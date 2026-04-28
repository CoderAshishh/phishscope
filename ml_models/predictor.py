import os
import pickle
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "phishing_rf_model.pkl")
_model = None

def load_model():
    global _model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)

def extract_features(text: str, input_type: str):
    # Extremely basic feature extraction for prototyping.
    length = len(text)
    has_special = 1 if any(char in "!@#$%^&*" for char in text) else 0
    redirects = 0
    if input_type == 'url':
        redirects = 1 if "redirect" in text.lower() or "login" in text.lower() else 0
    
    return np.array([[length, has_special, redirects]])

def predict_ml_score(text: str, input_type: str) -> float:
    global _model
    if _model is None:
        load_model()
    
    if _model is None:
        # Fallback if no model is found
        return 0.5

    features = extract_features(text, input_type)
    probabilities = _model.predict_proba(features)
    # Return probability of class 1 (phishing)
    return float(probabilities[0][1])

