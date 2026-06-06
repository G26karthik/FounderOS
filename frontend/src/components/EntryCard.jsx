import React from 'react';
import { 
  LightningIcon, 
  CheckIcon, 
  IdeaIcon, 
  SparklesIcon, 
  ChatIcon, 
  WarningIcon, 
  RefreshIcon, 
  TrashIcon 
} from './icons';

/**
 * FounderOS — Entry Card Component (Apple Style)
 * Renders a single decision, task, idea, or pattern entry with modern SVG icons and high contrast.
 */
export default function EntryCard({ entry, index = 0, onDelete, onUpdate }) {
  const { id, entry_type, text, date, metadata = {} } = entry;

  const typeConfig = {
    decision: { Icon: LightningIcon, label: 'Decision', badgeClass: 'badge-decision' },
    task: { Icon: CheckIcon, label: 'Task', badgeClass: 'badge-task' },
    idea: { Icon: IdeaIcon, label: 'Idea', badgeClass: 'badge-idea' },
    pattern: { Icon: SparklesIcon, label: 'Pattern', badgeClass: 'badge-pattern' },
  };

  const config = typeConfig[entry_type] || typeConfig.idea;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
      });
    } catch { 
      return dateStr; 
    }
  };

  const collectionMap = {
    decision: 'decisions',
    task: 'tasks',
    idea: 'ideas',
    pattern: 'patterns'
  };

  const handleStatusToggle = () => {
    if (!onUpdate) return;
    const nextStatus = metadata.status === 'done' ? 'pending' : 'done';
    onUpdate(collectionMap[entry_type], id, { ...metadata, status: nextStatus });
  };

  const handleDelete = () => {
    if (!onDelete) return;
    if (confirm(`Are you sure you want to permanently delete this ${entry_type} from memory?`)) {
      onDelete(collectionMap[entry_type], id);
    }
  };

  const { Icon } = config;

  return (
    <div
      className="glass-card p-5 animate-fade-in hover:scale-[1.002] hover:border-white/15 transition-all duration-300 flex flex-col gap-4 rounded-2xl border border-white/5"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3.5">
          {/* Metadata badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${config.badgeClass}`}>
              <Icon size={10} />
              <span>{config.label}</span>
            </span>
            {metadata.domain ? (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/3 text-[var(--color-text-secondary)] border border-white/5">
                {metadata.domain}
              </span>
            ) : null}
            {metadata.status ? (
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                metadata.status === 'blocked' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                metadata.status === 'done' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                'bg-white/3 text-[var(--color-text-secondary)] border-white/5'
              }`}>
                {metadata.status.replace('_', ' ')}
              </span>
            ) : null}
            {metadata.theme ? (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/3 text-[var(--color-text-secondary)] border border-white/5">
                {metadata.theme}
              </span>
            ) : null}
          </div>

          {/* Text content */}
          <p className={`text-sm text-white leading-relaxed font-semibold ${
            entry_type === 'task' && metadata.status === 'done' ? 'line-through opacity-40' : ''
          }`}>
            {text}
          </p>

          {/* Decision Rationale details */}
          {metadata.rationale && metadata.rationale !== 'not stated' ? (
            <div className="flex items-start gap-2 bg-white/2 p-3 rounded-xl border border-white/5 mt-1">
              <ChatIcon size={12} className="text-white opacity-70 mt-0.5" />
              <p className="text-xs text-[var(--color-text-secondary)] italic leading-normal font-semibold">
                {metadata.rationale}
              </p>
            </div>
          ) : null}

          {/* Blocked by alerts */}
          {metadata.blocked_by ? (
            <div className="flex items-center gap-2 bg-red-500/5 p-2.5 rounded-xl border border-red-500/10 mt-1">
              <WarningIcon size={12} className="text-red-400" />
              <p className="text-xs text-red-400 font-bold uppercase tracking-wider">
                Blocked by: {metadata.blocked_by}
              </p>
            </div>
          ) : null}
        </div>

        {/* Date and actions */}
        <div className="flex flex-col items-end gap-4 shrink-0">
          <div className="text-[9px] text-[var(--color-text-muted)] font-mono font-bold tracking-wider uppercase">
            {formatDate(date)}
          </div>
          
          <div className="flex gap-2">
            {/* Task done action toggle */}
            {entry_type === 'task' && onUpdate ? (
              <button
                onClick={handleStatusToggle}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  metadata.status === 'done'
                    ? 'border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20'
                    : 'border-white/5 text-[var(--color-text-secondary)] bg-white/3 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/5'
                }`}
                title={metadata.status === 'done' ? 'Mark Task Pending' : 'Mark Task Done'}
              >
                {metadata.status === 'done' ? <RefreshIcon size={12} /> : <CheckIcon size={12} />}
              </button>
            ) : null}
            
            {/* Delete button */}
            {onDelete ? (
              <button
                onClick={handleDelete}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/5 text-[var(--color-text-secondary)] bg-white/3 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer"
                title="Delete Entry"
              >
                <TrashIcon size={12} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Decision confidence bar */}
      {entry_type === 'decision' && metadata.confidence != null ? (
        <div className="flex items-center gap-3 bg-white/1 py-2 px-3 rounded-xl border border-white/3">
          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Confidence</span>
          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-white opacity-85"
              style={{ width: `${(metadata.confidence || 0) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-white">
            {Math.round((metadata.confidence || 0) * 100)}%
          </span>
        </div>
      ) : null}

      {/* Pattern frequency bar */}
      {entry_type === 'pattern' && metadata.frequency != null ? (
        <div className="flex items-center gap-3 bg-white/1 py-2 px-3 rounded-xl border border-white/3">
          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Frequency</span>
          <div className="flex items-center gap-1.5 flex-1">
            {Array.from({ length: Math.min(metadata.frequency, 10) }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white opacity-70" />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-white">
            ×{metadata.frequency}
          </span>
        </div>
      ) : null}
    </div>
  );
}
