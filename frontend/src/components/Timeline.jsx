import { useState, useEffect } from 'react';
import { getTimeline } from '../lib/api';
import EntryCard from './EntryCard';

/**
 * FounderOS — Timeline View
 * Filterable, chronological feed of all captured entries.
 */
export default function Timeline() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  const filters = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'decision', label: 'Decisions', icon: '⚡' },
    { id: 'task', label: 'Tasks', icon: '✅' },
    { id: 'idea', label: 'Ideas', icon: '💡' },
  ];

  const fetchEntries = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTimeline(type);
      setEntries(result.entries || []);
    } catch (err) {
      setError('Failed to load timeline. Is the backend running?');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(filter);
  }, [filter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Timeline</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {entries.length} entries captured
          </p>
        </div>
        <button
          onClick={() => fetchEntries(filter)}
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-[var(--color-accent-primary)] text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                : 'glass-card text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 space-y-2">
              <div className="shimmer h-3 rounded w-24" />
              <div className="shimmer h-4 rounded w-full" />
              <div className="shimmer h-4 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Entries */}
      {!loading && entries.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🎙️</div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            No entries yet
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Start speaking into your Omi device or use the "Log Thought" feature to add entries.
          </p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <EntryCard key={entry.id || i} entry={entry} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
