import React, { useState } from 'react';
import { generateDigest } from '../lib/api';
import { TimelineIcon, SparklesIcon, BrainIcon } from './icons';

/**
 * FounderOS — Pattern Insights Panel (Apple Style)
 * Triggers the PatternSynthesizer and displays recurring themes.
 */
export default function PatternInsights() {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateDigest(days);
      setDigest(result);
    } catch (err) {
      setError('Failed to generate digest. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Pattern Insights</h2>
        <p className="text-xs text-[var(--color-text-secondary)] font-semibold mt-1">
          AI-powered analysis of your recurring execution themes and blockers
        </p>
      </div>

      {/* Controls Card */}
      <div className="glass-card p-5 flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <label htmlFor="insights-select" className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Analyze last
          </label>
          <select
            id="insights-select"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="apple-input apple-select text-xs font-bold py-2 px-3 bg-white/3"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="apple-btn px-6 py-2.5 min-h-[38px] text-xs font-black uppercase tracking-wider"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <BrainIcon size={12} />
              <span>Generate Insights</span>
            </>
          )}
        </button>
      </div>

      {/* Error View */}
      {error ? (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/2 flex items-center gap-3 rounded-2xl animate-fade-in">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <p className="text-xs text-red-400 font-semibold">{error}</p>
        </div>
      ) : null}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="glass-card p-6 space-y-4 animate-pulse rounded-2xl border border-white/5">
          <div className="shimmer h-4 rounded w-1/3 bg-white/5" />
          <div className="shimmer h-3.5 rounded w-full bg-white/5" />
          <div className="shimmer h-3.5 rounded w-5/6 bg-white/5" />
        </div>
      ) : null}

      {/* Results */}
      {digest && !loading ? (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Card */}
          <div className="glass-card p-6 space-y-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <TimelineIcon className="text-white opacity-80" size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Digest Summary
                </span>
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/5 text-white border border-white/10">
                {digest.patterns_found} patterns found
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line font-semibold">
              {digest.summary}
            </p>
          </div>

          {/* Pattern Cards List */}
          {digest.patterns && digest.patterns.length > 0 ? (
            <div className="grid gap-4">
              {digest.patterns.map((pattern, i) => (
                <div 
                  key={i} 
                  className="glass-card p-5 space-y-3 rounded-2xl border border-white/5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="badge-pattern inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          <SparklesIcon size={10} />
                          <span>Pattern</span>
                        </span>
                        {pattern.frequency ? (
                          <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] bg-white/2 px-2 py-0.5 rounded border border-white/5">
                            ×{pattern.frequency} Matches
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-white leading-relaxed font-bold">
                        {pattern.pattern_description || pattern.text}
                      </p>
                      {pattern.evidence ? (
                        <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed bg-white/2 p-3 rounded-xl border border-white/3 italic">
                          Evidence: {pattern.evidence}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Empty State */}
      {!digest && !loading ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto space-y-4 rounded-2xl animate-fade-in border border-white/5">
          <div className="w-14 h-14 rounded-full bg-white/3 text-[var(--color-text-muted)] flex items-center justify-center mx-auto border border-white/5">
            <BrainIcon size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Synthesis Hub Ready</h3>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium max-w-xs mx-auto">
              Select an execution timeline and trigger pattern synthesis to extract work blockages, repeat decisions, and recurring project goals.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
