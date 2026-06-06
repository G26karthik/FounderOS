import React, { useState, useRef, useEffect } from 'react';
import { queryMemory, sendTestTranscript } from '../lib/api';
import { 
  MicIcon, 
  SearchIcon, 
  SendIcon, 
  CheckIcon, 
  SparklesIcon, 
  WarningIcon, 
  ArrowRightIcon 
} from './icons';

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
  const [speechSupported, setSpeechSupported] = useState(true);
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
    } else {
      setSpeechSupported(false);
    }
  }, [logMode]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(false);
      }
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
      setTimeout(() => setLogStatus(null), 4000);
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
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight gradient-text">Ask Your Chief of Staff</h2>
        <p className="text-[var(--color-text-secondary)] text-sm font-medium">
          Query your decisions, tasks, and ideas — or log new thoughts directly to memory
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-subtle)] p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <button
            onClick={() => setLogMode(false)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] ${
              !logMode
                ? 'bg-[var(--color-accent-primary)] text-white shadow-[0_4px_12px_rgba(99,102,241,0.2)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <SearchIcon size={14} />
            Query Memory
          </button>
          <button
            onClick={() => setLogMode(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] ${
              logMode
                ? 'bg-[var(--color-accent-primary)] text-white shadow-[0_4px_12px_rgba(99,102,241,0.2)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <MicIcon size={14} />
            Log Thought
          </button>
        </div>
      </div>

      {/* Mic Trigger Section */}
      <div className="flex flex-col items-center justify-center gap-3">
        {speechSupported ? (
          <button
            onClick={toggleListening}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border ${
              isListening
                ? 'mic-pulse bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                : 'bg-[var(--color-surface-secondary)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-text-primary)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:scale-105 active:scale-95'
            }`}
          >
            <MicIcon size={32} className={isListening ? 'animate-pulse' : ''} />
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-500/80 bg-amber-500/5 px-4 py-2 rounded-xl border border-amber-500/20">
            <WarningIcon size={14} />
            <span>Voice input is not supported in this browser. Please use text input below.</span>
          </div>
        )}
        {speechSupported ? (
          <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--color-text-muted)] font-semibold">
            {isListening ? "Listening — Speak Now" : "Click to Speak"}
          </span>
        ) : null}
      </div>

      {/* Text Form Input */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="search-input" className="sr-only">
              {logMode ? 'Log thoughts to memory' : 'Ask FounderOS memory'}
            </label>
            <input
              id="search-input"
              type="text"
              name="query"
              value={logMode ? logText : question}
              onChange={(e) => logMode ? setLogText(e.target.value) : setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={logMode ? 'Type your thought here to capture...' : 'Ask about your decisions, tasks, or distribution plans…'}
              autoComplete="off"
              className="w-full bg-transparent border-0 outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-sm px-2 py-1 focus:ring-0"
            />
          </div>
          <button
            onClick={logMode ? handleLog : handleQuery}
            disabled={loading || (logMode ? !logText.trim() : !question.trim())}
            className="glow-btn flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Thinking…</span>
              </>
            ) : (
              <>
                <SendIcon size={12} />
                <span>{logMode ? 'Log' : 'Ask'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {logStatus === 'sent' ? (
        <div className="glass-card p-4 border-[var(--color-task)]/30 animate-fade-in flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[var(--color-task)]/10 text-[var(--color-task)] flex items-center justify-center">
            <CheckIcon size={14} />
          </div>
          <p className="text-sm text-[var(--color-text-primary)] font-medium">
            Thought logged successfully! Capturing decisions and tasks in the background…
          </p>
        </div>
      ) : null}

      {logStatus === 'error' ? (
        <div className="glass-card p-4 border-[var(--color-danger)]/30 animate-fade-in flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] flex items-center justify-center">
            <WarningIcon size={14} />
          </div>
          <p className="text-sm text-[var(--color-text-primary)] font-medium">
            Failed to log thought. Please make sure the backend is active.
          </p>
        </div>
      ) : null}

      {/* Loading Shimmer Skeleton */}
      {loading ? (
        <div className="glass-card p-6 space-y-4 animate-pulse">
          <div className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] pb-3">
            <div className="w-5 h-5 rounded bg-white/5 shimmer" />
            <div className="w-32 h-4 rounded bg-white/5 shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-4 rounded bg-white/5 shimmer w-11/12" />
            <div className="h-4 rounded bg-white/5 shimmer w-full" />
            <div className="h-4 rounded bg-white/5 shimmer w-4/5" />
          </div>
        </div>
      ) : null}

      {/* Answer View */}
      {answer && !loading ? (
        <div className="glass-card p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3.5">
            <div className="flex items-center gap-2">
              <SparklesIcon className="text-[var(--color-accent-primary)]" size={18} />
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                FounderOS Intelligence
              </span>
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line font-medium">
            {answer}
          </p>

          {/* Sources List */}
          {sources.length > 0 ? (
            <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
              <p className="text-xs font-bold tracking-wider uppercase text-[var(--color-text-muted)] mb-3">
                Cited Memory Fragments ({sources.length})
              </p>
              <div className="space-y-2.5">
                {sources.map((src, i) => {
                  let badgeTypeClass = 'badge-idea';
                  if (src.entry_type === 'decision') badgeTypeClass = 'badge-decision';
                  if (src.entry_type === 'task') badgeTypeClass = 'badge-task';
                  if (src.entry_type === 'pattern') badgeTypeClass = 'badge-pattern';

                  return (
                    <div key={i} className="flex items-center gap-3 text-xs bg-white/1.5 p-2 rounded-xl border border-white/3 hover:border-white/8 transition-colors">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${badgeTypeClass}`}>
                        {src.entry_type}
                      </span>
                      <span className="text-[var(--color-text-secondary)] flex-1 line-clamp-1 font-medium">
                        {src.text}
                      </span>
                      <span className="font-mono text-[var(--color-text-muted)] font-bold bg-white/5 px-2 py-0.5 rounded-md">
                        {Math.round(src.score * 100)}% Match
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Suggested Prompts */}
      {!answer && !loading ? (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold tracking-wider uppercase text-[var(--color-text-muted)] text-center">
            Suggested Queries
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
            {[
              'What have I decided about our product scope?',
              'What keeps blocking me?',
              'What ideas have I had about distribution?',
              'Summarize my recent tasks',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => { setQuestion(prompt); setLogMode(false); }}
                className="text-xs px-4 py-2 rounded-xl border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-glow)] transition-all cursor-pointer font-medium focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
