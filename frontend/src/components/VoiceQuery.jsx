import React, { useState, useRef, useEffect } from 'react';
import { queryMemory, sendTestTranscript } from '../lib/api';
import { 
  MicIcon, 
  SearchIcon, 
  SendIcon, 
  CheckIcon, 
  SparklesIcon, 
  WarningIcon,
  VolumeIcon,
  MuteIcon
} from './icons';

/**
 * FounderOS — Voice Query Component (Apple Style with Voice Output)
 * Mic input with Web Speech API + text-to-speech feedback.
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
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
    
    // Stop speaking when leaving the tab
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
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

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean up text for better reading (remove markdown)
    const cleanText = text.replace(/[*#_`~]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleQuery = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    setSources([]);
    stopSpeaking();
    
    try {
      const result = await queryMemory(question);
      setAnswer(result.answer);
      setSources(result.sources || []);
      
      if (voiceEnabled && result.answer) {
        // Delay speaking slightly for smoother transition after loading state disappears
        setTimeout(() => speakText(result.answer), 300);
      }
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

  const toggleVoiceSetting = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="w-full space-y-10 animate-fade-in max-w-3xl mx-auto px-4">
      {/* Centered Heading */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-extrabold tracking-tight text-white">Ask Your Chief of Staff</h2>
        <p className="text-[var(--color-text-secondary)] text-sm font-semibold tracking-wide">
          Query decisions, tasks, and ideas — or stream thoughts directly into memory
        </p>
      </div>

      {/* Mode Selector & Voice Switch */}
      <div className="flex flex-col items-center gap-4 justify-center">
        <div className="inline-flex rounded-full bg-white/3 border border-white/5 p-1">
          <button
            onClick={() => setLogMode(false)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              !logMode
                ? 'bg-white text-black shadow-lg font-bold'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            <SearchIcon size={12} />
            Query Memory
          </button>
          <button
            onClick={() => setLogMode(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              logMode
                ? 'bg-white text-black shadow-lg font-bold'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            <MicIcon size={12} />
            Log Thought
          </button>
        </div>
        
        {/* Voice Readback Settings Toggle */}
        {!logMode && window.speechSynthesis ? (
          <button 
            onClick={toggleVoiceSetting}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-white transition-colors cursor-pointer"
          >
            {voiceEnabled ? <VolumeIcon size={12} /> : <MuteIcon size={12} />}
            <span>Voice readback is {voiceEnabled ? "Enabled" : "Disabled"}</span>
          </button>
        ) : null}
      </div>

      {/* Mic Trigger Section */}
      <div className="flex flex-col items-center justify-center gap-4">
        {speechSupported ? (
          <button
            onClick={toggleListening}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border ${
              isListening
                ? 'mic-pulse bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_24px_rgba(239,68,68,0.2)]'
                : 'bg-white/4 border-white/8 text-white hover:border-white/20 hover:bg-white/6 hover:scale-105 active:scale-95'
            }`}
          >
            <MicIcon size={28} className={isListening ? 'animate-pulse' : ''} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 text-xs text-amber-500 bg-amber-500/5 px-4.5 py-2.5 rounded-2xl border border-amber-500/10">
            <WarningIcon size={14} />
            <span className="font-semibold">Voice input is not supported. Please type in the input field.</span>
          </div>
        )}
        {speechSupported ? (
          <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--color-text-muted)] font-black">
            {isListening ? "Listening — speak now" : "Click to speak"}
          </span>
        ) : null}
      </div>

      {/* Search/Log input form (Apple Spotlight style) */}
      <div className="glass-card p-2 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 pl-3">
            <SearchIcon size={16} className="text-[var(--color-text-muted)]" />
            <label htmlFor="spotlight-input" className="sr-only">Input field</label>
            <input
              id="spotlight-input"
              type="text"
              name="query"
              value={logMode ? logText : question}
              onChange={(e) => logMode ? setLogText(e.target.value) : setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={logMode ? 'Speak or type your thought to log...' : 'Ask about product scope, marketing plans, blockers…'}
              autoComplete="off"
              className="w-full bg-transparent border-0 outline-none text-white placeholder:text-[var(--color-text-muted)] text-sm py-2.5 focus:ring-0"
            />
          </div>
          <button
            onClick={logMode ? handleLog : handleQuery}
            disabled={loading || (logMode ? !logText.trim() : !question.trim())}
            className="apple-btn px-6 py-2.5"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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

      {/* Logging Feedback Toasts */}
      {logStatus === 'sent' ? (
        <div className="glass-card p-4.5 border-green-500/20 bg-green-500/2 animate-fade-in flex items-center gap-3.5 rounded-2xl">
          <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
            <CheckIcon size={12} />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] font-semibold leading-normal">
            Thought logged successfully! Extracting decisions and tasks in the background…
          </p>
        </div>
      ) : null}

      {logStatus === 'error' ? (
        <div className="glass-card p-4.5 border-red-500/20 bg-red-500/2 animate-fade-in flex items-center gap-3.5 rounded-2xl">
          <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
            <WarningIcon size={12} />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] font-semibold leading-normal">
            Failed to connect to backend. Please ensure local service is running.
          </p>
        </div>
      ) : null}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="glass-card p-6 space-y-4 animate-pulse">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
            <div className="w-4 h-4 rounded-full bg-white/5 shimmer" />
            <div className="w-28 h-3.5 rounded bg-white/5 shimmer" />
          </div>
          <div className="space-y-2.5">
            <div className="h-3.5 rounded bg-white/5 shimmer w-11/12" />
            <div className="h-3.5 rounded bg-white/5 shimmer w-full" />
            <div className="h-3.5 rounded bg-white/5 shimmer w-2/3" />
          </div>
        </div>
      ) : null}

      {/* Answer Spotlight Card */}
      {answer && !loading ? (
        <div className="glass-card p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="text-white opacity-85" size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                FounderOS Response
              </span>
            </div>
            
            {/* Speech playback trigger buttons */}
            {window.speechSynthesis ? (
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    speakText(answer);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/5 bg-white/3 hover:bg-white/6 transition-all text-[9px] font-black uppercase tracking-wider text-white cursor-pointer"
                title={isSpeaking ? "Mute" : "Speak Response"}
              >
                {isSpeaking ? <MuteIcon size={10} /> : <VolumeIcon size={10} />}
                <span>{isSpeaking ? "Mute" : "Speak"}</span>
              </button>
            ) : null}
          </div>
          
          <p className="text-sm text-white leading-relaxed whitespace-pre-line font-semibold">
            {answer}
          </p>

          {/* Sources List */}
          {sources.length > 0 ? (
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-[10px] font-black tracking-widest uppercase text-[var(--color-text-muted)] mb-3">
                Cited Memory Fragments
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {sources.map((src, i) => {
                  let badgeTypeClass = 'badge-idea';
                  if (src.entry_type === 'decision') badgeTypeClass = 'badge-decision';
                  if (src.entry_type === 'task') badgeTypeClass = 'badge-task';
                  if (src.entry_type === 'pattern') badgeTypeClass = 'badge-pattern';

                  return (
                    <div key={i} className="flex items-center gap-3 bg-white/2 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${badgeTypeClass}`}>
                        {src.entry_type}
                      </span>
                      <span className="text-[var(--color-text-secondary)] flex-1 line-clamp-1 font-semibold text-xs">
                        {src.text}
                      </span>
                      <span className="font-mono text-[var(--color-text-muted)] text-[10px] font-bold">
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
        <div className="space-y-4 pt-2">
          <p className="text-[10px] font-black tracking-widest uppercase text-[var(--color-text-muted)] text-center">
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
                className="text-xs px-4.5 py-2.5 rounded-full border border-white/5 text-[var(--color-text-secondary)] hover:text-white hover:border-white/15 hover:bg-white/3 transition-all cursor-pointer font-bold focus-visible:ring-1 focus-visible:ring-white/25"
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
