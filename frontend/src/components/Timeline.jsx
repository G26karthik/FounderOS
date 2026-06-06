import React, { useState, useEffect } from 'react';
import { getTimeline, deleteEntry, updateEntry, getCollections } from '../lib/api';
import EntryCard from './EntryCard';
import { 
  TimelineIcon, 
  LightningIcon, 
  CheckIcon, 
  IdeaIcon, 
  SparklesIcon, 
  RefreshIcon, 
  MicIcon 
} from './icons';

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
    { id: 'all', label: 'All', Icon: TimelineIcon },
    { id: 'decision', label: 'Decisions', Icon: LightningIcon },
    { id: 'task', label: 'Tasks', Icon: CheckIcon },
    { id: 'idea', label: 'Ideas', Icon: IdeaIcon },
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">Activity Timeline</h2>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-1">
            {entries.length} entries captured chronologically
          </p>
        </div>
        <button
          onClick={() => fetchEntries(filter)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
        >
          <RefreshIcon size={12} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Decisions', count: stats.decisions, color: 'var(--color-decision)', bg: 'rgba(59, 130, 246, 0.08)', Icon: LightningIcon },
          { label: 'Tasks', count: stats.tasks, color: 'var(--color-task)', bg: 'rgba(16, 185, 129, 0.08)', Icon: CheckIcon },
          { label: 'Ideas', count: stats.ideas, color: 'var(--color-idea)', bg: 'rgba(245, 158, 11, 0.08)', Icon: IdeaIcon },
          { label: 'Patterns', count: stats.patterns, color: 'var(--color-pattern)', bg: 'rgba(139, 92, 246, 0.08)', Icon: SparklesIcon },
        ].map((stat) => {
          const { Icon } = stat;
          return (
            <div
              key={stat.label}
              className="glass-card p-5 flex items-center gap-4 border-l-4"
              style={{ borderLeftColor: stat.color }}
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center" 
                style={{ background: stat.bg, color: stat.color }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="text-3xl font-black font-mono tracking-tight text-[var(--color-text-primary)]">
                  {stat.count}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Navigation */}
      <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Filter timeline entries">
        {filters.map((f) => {
          const { Icon } = f;
          const isSelected = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              role="tab"
              aria-selected={isSelected}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] ${
                isSelected
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)] border border-[var(--color-accent-primary)]'
                  : 'glass-card text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)]'
              }`}
            >
              <Icon size={14} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error View */}
      {error ? (
        <div className="glass-card p-5 border-red-500/20 bg-red-500/5 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </div>
      ) : null}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 space-y-3 animate-pulse">
              <div className="flex gap-2.5">
                <div className="shimmer h-5 rounded w-16 bg-white/5" />
                <div className="shimmer h-5 rounded w-24 bg-white/5" />
              </div>
              <div className="shimmer h-4 rounded w-11/12 bg-white/5" />
              <div className="shimmer h-4 rounded w-3/4 bg-white/5" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Empty State View */}
      {!loading && entries.length === 0 ? (
        <div className="glass-card p-16 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/3 text-[var(--color-text-muted)] flex items-center justify-center mx-auto border border-white/5">
            <MicIcon size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
              No entries found
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] font-medium max-w-sm mx-auto">
              Start speaking into your Omi device, or use the "Log Thought" feature to populate your dashboard memory.
            </p>
          </div>
        </div>
      ) : null}

      {/* Entries List */}
      {!loading && entries.length > 0 ? (
        <div className="space-y-4">
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
      ) : null}
    </div>
  );
}
