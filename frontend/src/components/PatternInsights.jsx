import { useState } from 'react';
import { generateDigest } from '../lib/api';

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Pattern Insights</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          AI-powered analysis of your recurring themes and blockers
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card p-5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-text-secondary)]">Analyze last</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-[var(--color-surface-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]"
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
          className="glow-btn px-5 py-2 text-sm disabled:opacity-40"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : '🧠 Generate Insights'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-6 space-y-4">
          <div className="shimmer h-4 rounded w-1/2" />
          <div className="shimmer h-4 rounded w-full" />
          <div className="shimmer h-4 rounded w-3/4" />
          <div className="shimmer h-4 rounded w-2/3" />
        </div>
      )}

      {/* Results */}
      {digest && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary Card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📊</span>
              <span className="text-sm font-semibold gradient-text">Digest Summary</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]">
                {digest.patterns_found} patterns found
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">
              {digest.summary}
            </p>
          </div>

          {/* Pattern Cards */}
          {digest.patterns && digest.patterns.length > 0 && (
            <div className="grid gap-3">
              {digest.patterns.map((pattern, i) => (
                <div key={i} className="glass-card p-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge-pattern text-xs px-2.5 py-0.5 rounded-full font-medium">
                          🔮 Pattern
                        </span>
                        {pattern.frequency && (
                          <span className="text-xs font-mono text-[var(--color-text-muted)]">
                            ×{pattern.frequency}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {pattern.pattern_description || pattern.text}
                      </p>
                      {pattern.evidence && (
                        <p className="mt-2 text-xs text-[var(--color-text-muted)] italic">
                          Evidence: {pattern.evidence}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!digest && !loading && (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🔮</div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            Ready to analyze
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Click "Generate Insights" to discover patterns in your decisions, tasks, and ideas.
          </p>
        </div>
      )}
    </div>
  );
}
