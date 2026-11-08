import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT.parent / "data" / "mail_data.csv"
MODEL = ROOT / "spam_model.joblib"

df = pd.read_csv(DATA)
df = df[["Category", "Message"]].dropna()
df["Category"] = df["Category"].astype(str).str.lower().str.strip()
df["Message"] = df["Message"].astype(str)
df = df[df["Category"].isin(["spam", "ham"])]
df = df.drop_duplicates(subset=["Message"])

X_train, X_test, y_train, y_test = train_test_split(
    df["Message"], df["Category"], test_size=0.2, random_state=42, stratify=df["Category"]
)

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=0.98,
                               sublinear_tf=True, strip_accents="unicode")),
    ("classifier", LogisticRegression(max_iter=2000, class_weight="balanced"))
])
pipeline.fit(X_train, y_train)
pred = pipeline.predict(X_test)
print(f"Test accuracy: {accuracy_score(y_test, pred):.4f}")
print(classification_report(y_test, pred, digits=4))
print("Confusion matrix [ham, spam]:")
print(confusion_matrix(y_test, pred, labels=["ham", "spam"]))
joblib.dump(pipeline, MODEL)
print(f"Saved model: {MODEL}")
