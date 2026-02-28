import re
import os
import joblib
from typing import Optional

# Phase 1: Rule-based classification
def rule_based_triage(symptoms: str) -> str:
    """
    Classifies symptoms into 'Emergency' or 'Normal' using keyword matching.
    """
    symptoms_lower = symptoms.lower()
    
    # Critical keywords indicating an emergency
    emergency_keywords = [
        r'\bchest pain\b',
        r'\bbreathing issue(s)?\b',
        r'\bshortness of breath\b',
        r'\bbleeding\b',
        r'\bunconscious\b'
    ]
    
    for pattern in emergency_keywords:
        if re.search(pattern, symptoms_lower):
            return "Emergency"
            
    return "Normal"

# Phase 2: Optional ML Model using sklearn
MODEL_PATH = "triage_model.pkl"
VECTORIZER_PATH = "triage_vectorizer.pkl"

def ml_based_triage(symptoms: str) -> Optional[str]:
    """
    Attempts to classify using an sklearn ML model if available.
    Returns 'Emergency' or 'Normal' if successful, or None if models are missing.
    """
    if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            vectorizer = joblib.load(VECTORIZER_PATH)
            
            # Vectorize the input text
            X_input = vectorizer.transform([symptoms])
            
            # Predict (Assuming 1 = Emergency, 0 = Normal)
            prediction = model.predict(X_input)
            
            if prediction[0] == 1:
                return "Emergency"
            return "Normal"
        except Exception as e:
            # Fallback if prediction fails
            print(f"ML Model prediction failed: {e}")
            return None
    return None

def triage(symptoms: str) -> str:
    """
    Clean python function classifying symptoms: Phase 1 (Rules) + Phase 2 (ML).
    """
    # 1. First Pass: Rule-based for immediate keyword matches (safest for emergencies)
    result = rule_based_triage(symptoms)
    if result == "Emergency":
        return result
        
    # 2. Second Pass: ML Model (Optional Phase 2)
    # Applied if rule-based classification returned "Normal" to catch complex cases
    ml_result = ml_based_triage(symptoms)
    if ml_result is not None:
        return ml_result
        
    return "Normal"

# -------------------------------------------------------------------
# Helper function to generate and save a mock sklearn model (Phase 2)
# -------------------------------------------------------------------
def train_and_save_mock_model():
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    
    # Mock training dataset
    corpus = [
        "severe chest pain and arm numbness", # Emergency
        "unconscious patient in the lobby",   # Emergency
        "heavy bleeding from a cut",          # Emergency
        "breathing issues and wheezing",      # Emergency
        "mild headache since morning",        # Normal
        "upset stomach and slight nausea",    # Normal
        "light fever and constant cough",     # Normal
        "routine wellness checkup"            # Normal
    ]
    labels = [1, 1, 1, 1, 0, 0, 0, 0]         # 1: Emergency, 0: Normal
    
    # Train vectorizer and model
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(corpus)
    
    model = LogisticRegression()
    model.fit(X, labels)
    
    # Serialize to disk
    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    print("Mock sklearn ML model trained and saved successfully.")

# To test or generate the model, uncomment the line below:
# train_and_save_mock_model()
