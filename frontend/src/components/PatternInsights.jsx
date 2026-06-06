import React, { useState } from 'react';
import { generateDigest } from '../lib/api';
import { TimelineIcon, SparklesIcon, BrainIcon } from './icons';

/**
 * FounderOS — Pattern Insights Panel
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">Pattern Insights</h2>
        <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-1">
          AI-powered analysis of your recurring execution themes and blockers
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card p-5 flex items-center gap-5 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="days-select" className="text-sm font-semibold text-[var(--color-text-secondary)]">
            Analyze last
          </label>
          <select
            id="days-select"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-[var(--color-surface-secondary)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] font-semibold min-h-[44px]"
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
          className="glow-btn flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider min-h-[44px]"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <BrainIcon size={14} />
              <span>Generate Insights</span>
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error ? (
        <div className="glass-card p-5 border-red-500/20 bg-red-500/5 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </div>
      ) : null}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="glass-card p-6 space-y-4 animate-pulse">
          <div className="shimmer h-5 rounded w-1/3 bg-white/5" />
          <div className="shimmer h-4 rounded w-full bg-white/5" />
          <div className="shimmer h-4 rounded w-11/12 bg-white/5" />
          <div className="shimmer h-4 rounded w-5/6 bg-white/5" />
        </div>
      ) : null}

      {/* Results */}
      {digest && !loading ? (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <TimelineIcon className="text-[var(--color-accent-primary)]" size={18} />
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Digest Summary
                </span>
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] border border-[var(--color-border-glow)]">
                {digest.patterns_found} patterns found
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line font-medium">
              {digest.summary}
            </p>
          </div>

          {/* Pattern Cards Grid */}
          {digest.patterns && digest.patterns.length > 0 ? (
            <div className="grid gap-4">
              {digest.patterns.map((pattern, i) => (
                <div 
                  key={i} 
                  className="glass-card p-5 animate-fade-in space-y-3" 
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="badge-pattern inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <SparklesIcon size={10} />
                          <span>Pattern</span>
                        </span>
                        {pattern.frequency ? (
                          <span className="text-xs font-mono font-bold text-[var(--color-text-muted)] bg-white/3 px-2 py-0.5 rounded-md">
                            ×{pattern.frequency} Matches
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed font-semibold">
                        {pattern.pattern_description || pattern.text}
                      </p>
                      {pattern.evidence ? (
                        <p className="text-xs text-[var(--color-text-muted)] font-medium leading-normal bg-white/1.5 p-3 rounded-xl border border-white/3 italic">
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
        <div className="glass-card p-16 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/3 text-[var(--color-text-muted)] flex items-center justify-center mx-auto border border-white/5">
            <BrainIcon size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
              Synthesis Hub Ready
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] font-medium max-w-sm mx-auto">
              Synthesize memory logs across selected timelines to uncover key work blockages, repeat decisions, and recurring product goals.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
