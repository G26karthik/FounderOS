import { useState, useEffect } from 'react';
import { getTimeline, deleteEntry, updateEntry, getCollections } from '../lib/api';
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
  const [stats, setStats] = useState({ decisions: 0, tasks: 0, ideas: 0, patterns: 0 });

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

      // Fetch collection stats for metrics dashboard
      const statsRes = await getCollections();
      const newStats = { decisions: 0, tasks: 0, ideas: 0, patterns: 0 };
      statsRes.collections?.forEach((c) => {
        newStats[c.name] = c.count;
      });
      setStats(newStats);
    } catch (err) {
      setError('Failed to load timeline. Is the backend running?');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (collection, id) => {
    try {
      await deleteEntry(collection, id);
      fetchEntries(filter);
    } catch (err) {
      alert(`Failed to delete entry: ${err.message}`);
    }
  };

  const handleUpdate = async (collection, id, payload) => {
    try {
      await updateEntry(collection, id, payload);
      fetchEntries(filter);
    } catch (err) {
      alert(`Failed to update entry: ${err.message}`);
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        {[
          { label: 'Decisions', count: stats.decisions, color: 'var(--color-decision)', bg: 'rgba(59, 130, 246, 0.05)', icon: '⚡' },
          { label: 'Tasks', count: stats.tasks, color: 'var(--color-task)', bg: 'rgba(16, 185, 129, 0.05)', icon: '✅' },
          { label: 'Ideas', count: stats.ideas, color: 'var(--color-idea)', bg: 'rgba(245, 158, 11, 0.05)', icon: '💡' },
          { label: 'Patterns', count: stats.patterns, color: 'var(--color-pattern)', bg: 'rgba(139, 92, 246, 0.05)', icon: '🔮' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card p-4 flex items-center gap-4 border-l-4"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">{stat.count}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">{stat.label}</div>
            </div>
          </div>
        ))}
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
            <EntryCard
              key={entry.id || i}
              entry={entry}
              index={i}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
