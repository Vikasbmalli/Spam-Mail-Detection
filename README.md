# MailGuard

MailGuard is a local-first spam detection app for email and SMS text. It combines a FastAPI service and a scikit-learn text-classification pipeline with a responsive React dashboard.

The interface presents a prediction, confidence, class probabilities, and heuristic text signals. It also includes sample messages and a short scan history stored in the current browser.

## Features

- Spam-versus-ham classification using TF-IDF features and logistic regression.
- Confidence and class-probability display with heuristic message signals.
- Click-to-load example spam and ham messages.
- Up to 12 recent scans saved in browser `localStorage`; select an entry to review it again or clear the history.
- Responsive dark interface with layered glow effects and reduced-motion support.
- Local API processing; messages are not sent to a third-party service by this application.

## Project layout

```text
.
├── backend/
│   ├── app.py                 # FastAPI prediction API
│   ├── requirements.txt
│   ├── spam_model.joblib      # Trained pipeline used by the API
│   └── train_model.py         # Dataset cleanup, training, and evaluation
├── data/
│   └── mail_data.csv          # Labeled message dataset
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       └── styles.css
└── README.md
```

## Requirements

- Python 3.10 or later
- Node.js 18 or later and npm

## Run locally

Open two terminals from the project root.

### 1. Start the API

In the first terminal, run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

The repository includes a trained model. To retrain it from `data/mail_data.csv`, run:

```powershell
python train_model.py
```

Start the API:

```powershell
uvicorn app:app --reload
```

The API is available at `http://127.0.0.1:8000`; interactive API documentation is at `http://127.0.0.1:8000/docs`.

### 2. Start the frontend

In a second terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## API

### `POST /predict`

Request:

```json
{
  "message": "Your message text goes here"
}
```

The message must contain between 3 and 20,000 characters. The response includes:

| Field | Description |
|---|---|
| `prediction` | `SPAM` or `SAFE` |
| `label` | Model label: `spam` or `ham` |
| `confidence` | Confidence for the predicted class, as a percentage |
| `spam_probability` | Estimated spam probability, as a percentage |
| `safe_probability` | Estimated ham probability, as a percentage |
| `signals` | Matching heuristic cues; these are not a full model explanation |

`GET /health` reports whether the API and model are available.

## Training and evaluation

The training script reads the CSV, normalizes labels, removes missing or duplicate messages, makes a stratified train/test split, and trains a TF-IDF plus logistic-regression pipeline. It prints accuracy, a classification report, and a confusion matrix before saving the model to `backend/spam_model.joblib`.

## Privacy and data

Predictions are processed by the local FastAPI service. Recent scans are stored in browser `localStorage` on the device and browser profile used; they are not synchronized or protected as a secure vault. Clear the scan history from the dashboard or clear this browser's site data to remove those records.

The repository includes the CSV dataset and trained model. Before redistributing the dataset in a public repository, verify that its original source and applicable terms permit redistribution. Do not add credentials, private messages, or other sensitive data.

## Publish to GitHub

The repository has a root `.gitignore` that excludes virtual environments, installed frontend packages, build output, caches, and local environment files. The dataset and trained model are intentionally not ignored.

After creating an empty repository on GitHub, run these commands from the project root, replacing the URL with your repository's URL:

```powershell
git init
git add .
git status
git commit -m "Initial MailGuard release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Review `git status` before committing to confirm only intended project files are staged. If Git has not been configured on this computer, set `user.name` and `user.email` before committing.
