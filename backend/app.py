from pathlib import Path
import re
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODEL_PATH = Path(__file__).resolve().parent / "spam_model.joblib"
if not MODEL_PATH.exists():
    raise RuntimeError("Model missing. Run: python train_model.py")
model = joblib.load(MODEL_PATH)

app = FastAPI(title="MailGuard API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

class MailRequest(BaseModel):
    message: str = Field(min_length=3, max_length=20000)

@app.get("/")
def root():
    return {"name": "MailGuard API", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True}

@app.post("/predict")
def predict(payload: MailRequest):
    text = payload.message.strip()
    label = model.predict([text])[0]
    probs = model.predict_proba([text])[0]
    classes = list(model.classes_)
    confidence = float(probs[classes.index(label)])
    # Lightweight explainability: surface suspicious cues, not a causal explanation.
    cues = []
    checks = [
        (r"\b(free|winner|won|prize|claim|urgent|congratulations)\b", "Prize / urgency language"),
        (r"\b(click|visit|link|http|www)\b", "Link or click language"),
        (r"\b(credit|cash|loan|offer|money)\b", "Financial offer language"),
        (r"\b(verify|account|password|login)\b", "Account / verification language"),
    ]
    for pattern, cue in checks:
        if re.search(pattern, text, re.I):
            cues.append(cue)
    return {
        "prediction": "SPAM" if label == "spam" else "SAFE",
        "label": label,
        "confidence": round(confidence * 100, 2),
        "spam_probability": round(float(probs[classes.index("spam")]) * 100, 2),
        "safe_probability": round(float(probs[classes.index("ham")]) * 100, 2),
        "signals": cues[:4]
    }
