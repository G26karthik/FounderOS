import { useState, useRef, useEffect } from 'react';
import { queryMemory, sendTestTranscript } from '../lib/api';

/**
 * FounderOS — Voice Query Component
 * Mic input with Web Speech API + text fallback + response display.
 */
export default function VoiceQuery() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [logMode, setLogMode] = useState(false);
  const [logText, setLogText] = useState('');
  const [logStatus, setLogStatus] = useState(null);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (logMode) {
          setLogText(transcript);
        } else {
          setQuestion(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [logMode]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleQuery = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    setSources([]);
    try {
      const result = await queryMemory(question);
      setAnswer(result.answer);
      setSources(result.sources || []);
    } catch (err) {
      setAnswer('Something went wrong. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async () => {
    if (!logText.trim()) return;
    setLogStatus('sending');
    try {
      await sendTestTranscript(logText);
      setLogStatus('sent');
      setLogText('');
      setTimeout(() => setLogStatus(null), 3000);
    } catch {
      setLogStatus('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      logMode ? handleLog() : handleQuery();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Ask Your Chief of Staff</h2>
        <p className="text-[var(--color-text-muted)]">
          Query your decisions, tasks, and ideas — or log new thoughts
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-subtle)] p-1">
          <button
            onClick={() => setLogMode(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !logMode
                ? 'bg-[var(--color-accent-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            🔍 Query Memory
          </button>
          <button
            onClick={() => setLogMode(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              logMode
                ? 'bg-[var(--color-accent-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            🎤 Log Thought
          </button>
        </div>
      </div>

      {/* Mic Button */}
      <div className="flex justify-center">
        <button
          onClick={toggleListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-300 ${
            isListening
              ? 'mic-pulse bg-[var(--color-accent-primary)] shadow-[0_0_40px_rgba(99,102,241,0.4)]'
              : 'bg-[var(--color-surface-secondary)] border-2 border-[var(--color-border-subtle)] hover:border-[var(--color-accent-primary)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]'
          }`}
          title={recognitionRef.current ? 'Click to speak' : 'Speech not supported — type below'}
        >
          {isListening ? '🔴' : '🎙️'}
        </button>
      </div>

      {/* Input */}
      <div className="glass-card p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={logMode ? logText : question}
            onChange={(e) => logMode ? setLogText(e.target.value) : setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={logMode ? 'Speak or type your thought to log...' : 'Ask about your decisions, tasks, or ideas...'}
            className="flex-1 bg-transparent border-none outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-sm"
          />
          <button
            onClick={logMode ? handleLog : handleQuery}
            disabled={loading || (logMode ? !logText.trim() : !question.trim())}
            className="glow-btn px-5 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Thinking...
              </span>
            ) : logMode ? '📥 Log' : '🚀 Ask'}
          </button>
        </div>
      </div>

      {/* Log Status */}
      {logStatus === 'sent' && (
        <div className="glass-card p-4 border-[var(--color-task)]/30 animate-fade-in">
          <p className="text-sm text-[var(--color-task)] flex items-center gap-2">
            ✅ Thought logged! Processing through AI agents...
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-6 space-y-3">
          <div className="shimmer h-4 rounded-lg w-3/4" />
          <div className="shimmer h-4 rounded-lg w-full" />
          <div className="shimmer h-4 rounded-lg w-2/3" />
        </div>
      )}

      {/* Answer */}
      {answer && !loading && (
        <div className="glass-card p-6 animate-fade-in space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-semibold gradient-text">FounderOS Response</span>
          </div>
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">
            {answer}
          </p>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
              <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">
                Sources ({sources.length})
              </p>
              <div className="space-y-2">
                {sources.map((src, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`inline-flex px-2 py-0.5 rounded-full ${
                      `badge-${src.entry_type}`
                    }`}>
                      {src.entry_type}
                    </span>
                    <span className="text-[var(--color-text-secondary)] flex-1 line-clamp-1">
                      {src.text}
                    </span>
                    <span className="font-mono text-[var(--color-text-muted)]">
                      {Math.round(src.score * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Prompts */}
      {!answer && !loading && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-text-muted)] text-center">Try asking:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'What have I decided about our product scope?',
              'What keeps blocking me?',
              'What ideas have I had about distribution?',
              'Summarize my recent tasks',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => { setQuestion(prompt); setLogMode(false); }}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
