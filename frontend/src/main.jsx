import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  ArrowRight,
  Clock3,
  LockKeyhole,
  Mail,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import './styles.css';

const API = 'http://127.0.0.1:8000';
const HISTORY_KEY = 'mailguard.scan-history';
const MAX_HISTORY = 12;

const samples = [
  {
    label: 'Prize notification',
    kind: 'spam',
    message:
      'Congratulations! You have won a free prize. Click here now to claim your reward before it expires.',
  },
  {
    label: 'Account verification',
    kind: 'spam',
    message:
      'URGENT: Your account needs verification. Visit the secure link now to avoid losing access.',
  },
  {
    label: 'Friendly check-in',
    kind: 'ham',
    message:
      'Hey, are we still meeting for lunch tomorrow? Let me know what time works for you.',
  },
  {
    label: 'Delivery update',
    kind: 'ham',
    message:
      'Your parcel has been delivered. It was left with reception. Have a nice day!',
  },
];

function App() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyNotice, setHistoryNotice] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) {
          throw new Error('Saved scan history is not a list.');
        }
        setHistory(parsed.slice(0, MAX_HISTORY));
      }
    } catch (storageError) {
      setHistoryNotice(`Could not load saved history: ${storageError.message}`);
    }
  }, []);

  async function scan() {
    const text = message.trim();
    if (text.length < 3) {
      setError('Enter a message with at least 3 characters.');
      return;
    }
    if (text.length > 20000) {
      setError('Messages must be 20,000 characters or fewer.');
      return;
    }

    setLoading(true);
    setError('');
    setHistoryNotice('');
    try {
      const response = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.map((item) => item.msg).join(', ')
          : data.detail;
        throw new Error(detail || 'Prediction failed.');
      }

      setResult(data);
      const record = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message: text,
        result: data,
        createdAt: new Date().toISOString(),
      };
      const updatedHistory = [record, ...history].slice(0, MAX_HISTORY);
      setHistory(updatedHistory);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch (storageError) {
        setHistoryNotice(`This scan is not saved in browser storage: ${storageError.message}`);
      }
    } catch (scanError) {
      setError(`${scanError.message} Is the FastAPI server running on port 8000?`);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessage('');
    setResult(null);
    setError('');
  }

  function loadRecord(record) {
    setMessage(record.message);
    setResult(record.result);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
      setHistoryNotice('');
    } catch (storageError) {
      setHistoryNotice(`Could not clear saved history: ${storageError.message}`);
    }
  }

  const isSpam = result?.prediction === 'SPAM';

  return (
    <div className="app-shell">
      <div className="ambient ambient-violet" />
      <div className="ambient ambient-cyan" />
      <div className="ambient ambient-pink" />

      <nav className="nav">
        <div className="brand" aria-label="MailGuard">
          <span className="brand-icon"><ShieldCheck size={19} /></span>
          <span>MAIL<span className="accent">GUARD</span></span>
          <span className="tag">AI SECURITY</span>
        </div>
        <div className="nav-right">
          <span className="live-dot" />
          <span>MODEL ONLINE</span>
          <span className="nav-divider" />
          <LockKeyhole size={14} />
          <span>PRIVATE ANALYSIS</span>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> INTELLIGENT MESSAGE SCREENING</div>
          <h1>Inbox security,<br /><span className="gradient-text">reimagined.</span></h1>
          <p className="sub">
            Detect suspicious messages before they reach you.
            <br />Fast, explainable, and powered by machine learning.
          </p>
        </section>

        <section className="workspace" aria-label="Spam message analyzer">
          <div className="panel input-panel">
            <div className="panel-head">
              <div className="section-icon"><Mail size={17} /></div>
              <div><h2>Message analyzer</h2><p>Paste an email or SMS to inspect it</p></div>
              <span className="step">01 / INPUT</span>
            </div>

            <label className="field-label" htmlFor="message">MESSAGE CONTENT</label>
            <textarea
              id="message"
              maxLength={20000}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setError('');
              }}
              placeholder={'Paste the email or message text here…\n\nExample: Congratulations! You have won a free prize. Click here to claim now.'}
            />
            <div className="input-meta">
              <span>{message.length.toLocaleString()} / 20,000 characters</span>
              <span>Text only · No files uploaded</span>
            </div>

            <div className="samples">
              <div className="samples-heading">
                <span>TRY A SAMPLE</span>
                <span>Click to load an example</span>
              </div>
              <div className="sample-list">
                {samples.map((sample) => (
                  <button
                    className={`sample-chip ${sample.kind}`}
                    key={sample.label}
                    onClick={() => {
                      setMessage(sample.message);
                      setResult(null);
                      setError('');
                    }}
                    type="button"
                  >
                    <span className="sample-dot" />{sample.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="error" role="alert">{error}</div>}
            <div className="actions">
              <button className="primary" onClick={scan} disabled={loading} type="button">
                <ScanLine size={17} />
                {loading ? 'Analyzing message…' : 'Analyze message'}
                <ArrowRight size={16} />
              </button>
              <button className="reset" onClick={reset} type="button"><RotateCcw size={15} /> Clear</button>
            </div>
            <div className="privacy"><LockKeyhole size={13} /> Your message is processed by your local API instance.</div>
          </div>

          <div className={`panel result-panel ${result ? 'has-result' : ''}`}>
            <div className="panel-head">
              <div className="section-icon violet"><Activity size={17} /></div>
              <div><h2>Detection result</h2><p>Classification &amp; confidence</p></div>
              <span className="step">02 / RESULT</span>
            </div>
            {!result ? (
              <div className="empty">
                <div className="orbit"><div className="orbit-inner"><ScanLine size={27} /></div></div>
                <h3>Awaiting analysis</h3>
                <p>Your scan results will appear here.<br />Submit a message to get started.</p>
                <div className="empty-line" />
              </div>
            ) : (
              <div className="result-content" aria-live="polite">
                <div className={`verdict ${isSpam ? 'danger' : 'safe'}`}>
                  <div className="verdict-icon">
                    {isSpam ? <ShieldAlert size={25} /> : <ShieldCheck size={25} />}
                  </div>
                  <div>
                    <span className="verdict-label">MESSAGE CLASSIFIED AS</span>
                    <h3>{isSpam ? 'Potential spam' : 'Likely safe'}</h3>
                    <p>{isSpam ? 'Suspicious patterns detected in this message.' : 'No strong spam patterns detected.'}</p>
                  </div>
                </div>
                <div className="confidence">
                  <div className="conf-top"><span>MODEL CONFIDENCE</span><strong>{result.confidence}%</strong></div>
                  <div className="bar"><div style={{ width: `${result.confidence}%` }} /></div>
                  <div className="conf-foot">
                    <span>Classification certainty</span>
                    <span>{result.confidence >= 80 ? 'HIGH' : result.confidence >= 60 ? 'MODERATE' : 'LOW'}</span>
                  </div>
                </div>
                <div className="prob-grid">
                  <div><span>SPAM PROBABILITY</span><strong className="red">{result.spam_probability}%</strong></div>
                  <div><span>SAFE PROBABILITY</span><strong className="green">{result.safe_probability}%</strong></div>
                </div>
                <div className="signals">
                  <h4><Zap size={14} /> DETECTED TEXT SIGNALS</h4>
                  {result.signals.length
                    ? result.signals.map((signal) => <span className="signal" key={signal}>{signal}</span>)
                    : <span className="no-signals">No common keyword signals found</span>}
                  <p>Signals are heuristic cues, not the model&apos;s full explanation.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="history-panel panel">
          <div className="history-head">
            <div className="panel-head">
              <div className="section-icon violet"><Clock3 size={17} /></div>
              <div><h2>Recent scans</h2><p>Saved in this browser on this device</p></div>
              <span className="history-count">{history.length} / {MAX_HISTORY}</span>
            </div>
            {history.length > 0 && (
              <button className="clear-history" onClick={clearHistory} type="button">
                <Trash2 size={14} /> Clear history
              </button>
            )}
          </div>
          {historyNotice && <div className="history-notice" role="status">{historyNotice}</div>}
          {history.length === 0 ? (
            <div className="history-empty">Your analyzed messages will appear here.</div>
          ) : (
            <div className="history-list">
              {history.map((record) => (
                <button className="history-item" key={record.id} onClick={() => loadRecord(record)} type="button">
                  <span className={`history-status ${record.result.prediction === 'SPAM' ? 'danger' : 'safe'}`}>
                    {record.result.prediction === 'SPAM' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                  </span>
                  <span className="history-copy">
                    <span className="history-message">{record.message}</span>
                    <span className="history-time">
                      {new Date(record.createdAt).toLocaleString()} · {record.result.confidence}% confidence
                    </span>
                  </span>
                  <span className={`history-label ${record.result.prediction === 'SPAM' ? 'danger' : 'safe'}`}>
                    {record.result.prediction === 'SPAM' ? 'SPAM' : 'SAFE'}
                  </span>
                  <ArrowRight className="history-arrow" size={15} />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="metrics" aria-label="Project highlights">
          <div><span className="metric-icon"><Activity size={16} /></span><div><strong>TF-IDF + Logistic Regression</strong><small>Machine-learning classification</small></div></div>
          <div><span className="metric-icon"><LockKeyhole size={16} /></span><div><strong>Local processing</strong><small>Messages stay on your machine</small></div></div>
          <div><span className="metric-icon"><Zap size={16} /></span><div><strong>Instant inference</strong><small>Lightweight and responsive</small></div></div>
        </section>

        <footer>
          <span>MAILGUARD <span className="accent">/</span> SPAM DETECTION</span>
          <span>BUILT FOR A SAFER INBOX <span className="accent">✦</span></span>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
