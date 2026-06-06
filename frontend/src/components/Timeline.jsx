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
 * FounderOS — Timeline View (Apple Style)
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
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Activity Timeline</h2>
          <p className="text-xs text-[var(--color-text-secondary)] font-semibold mt-1">
            {entries.length} entries captured chronologically
          </p>
        </div>
        <button
          onClick={() => fetchEntries(filter)}
          className="apple-btn apple-btn-secondary px-4 py-2"
        >
          <RefreshIcon size={12} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Compact Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Decisions', count: stats.decisions, color: 'var(--color-decision)', bg: 'rgba(47, 128, 237, 0.06)', Icon: LightningIcon },
          { label: 'Tasks', count: stats.tasks, color: 'var(--color-task)', bg: 'rgba(39, 174, 96, 0.06)', Icon: CheckIcon },
          { label: 'Ideas', count: stats.ideas, color: 'var(--color-idea)', bg: 'rgba(242, 153, 74, 0.06)', Icon: IdeaIcon },
          { label: 'Patterns', count: stats.patterns, color: 'var(--color-pattern)', bg: 'rgba(155, 81, 224, 0.06)', Icon: SparklesIcon },
        ].map((stat) => {
          const { Icon } = stat;
          return (
            <div
              key={stat.label}
              className="glass-card p-4 flex flex-col justify-between h-24"
              style={{ borderLeft: `3px solid ${stat.color}` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  {stat.label}
                </span>
                <span style={{ color: stat.color }}>
                  <Icon size={14} />
                </span>
              </div>
              <div className="text-2xl font-black font-mono tracking-tight text-white mt-1">
                {stat.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Apple Style Segment Selector Tabbed Navigation */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-white/3 border border-white/5 p-1" role="tablist" aria-label="Filter timeline entries">
          {filters.map((f) => {
            const { Icon } = f;
            const isSelected = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                role="tab"
                aria-selected={isSelected}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer focus-visible:ring-1 focus-visible:ring-white/20 ${
                  isSelected
                    ? 'bg-white text-black shadow-lg font-bold'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                <Icon size={12} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error View */}
      {error ? (
        <div className="glass-card p-4.5 border-red-500/20 bg-red-500/2 flex items-center gap-3 rounded-2xl animate-fade-in">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <p className="text-xs text-red-400 font-semibold">{error}</p>
        </div>
      ) : null}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 space-y-3.5 animate-pulse rounded-2xl">
              <div className="flex gap-2">
                <div className="shimmer h-4 rounded w-16 bg-white/5" />
                <div className="shimmer h-4 rounded w-24 bg-white/5" />
              </div>
              <div className="shimmer h-3.5 rounded w-11/12 bg-white/5" />
              <div className="shimmer h-3.5 rounded w-2/3 bg-white/5" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && entries.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto space-y-4 rounded-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-white/3 text-[var(--color-text-muted)] flex items-center justify-center mx-auto border border-white/5">
            <MicIcon size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No entries logged</h3>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium max-w-xs mx-auto">
              Your Chief of Staff memory is empty. Use voice capture or the "Log Thought" console to begin tracking execution.
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
