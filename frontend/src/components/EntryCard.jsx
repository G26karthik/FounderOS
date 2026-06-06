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
 * FounderOS — Entry Card Component
 * Renders a single decision, task, idea, or pattern entry with modern SVG icons.
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
    if (confirm(`Are you sure you want to permanently delete this ${entry_type} from your memory?`)) {
      onDelete(collectionMap[entry_type], id);
    }
  };

  const { Icon } = config;

  return (
    <div
      className="glass-card p-5 animate-fade-in hover:scale-[1.005] hover:border-[var(--color-border-glow)] transition-all duration-300 flex flex-col gap-4"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Type badge + metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.badgeClass}`}>
              <Icon size={12} />
              <span>{config.label}</span>
            </span>
            {metadata.domain ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-[var(--color-text-secondary)] border border-white/5">
                {metadata.domain}
              </span>
            ) : null}
            {metadata.status ? (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                metadata.status === 'blocked' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                metadata.status === 'done' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                'bg-white/5 text-[var(--color-text-secondary)] border-white/5'
              }`}>
                {metadata.status.replace('_', ' ')}
              </span>
            ) : null}
            {metadata.theme ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-[var(--color-text-secondary)] border border-white/5">
                {metadata.theme}
              </span>
            ) : null}
          </div>

          {/* Content */}
          <p className={`text-sm text-[var(--color-text-primary)] leading-relaxed font-medium ${
            entry_type === 'task' && metadata.status === 'done' ? 'line-through opacity-45' : ''
          }`}>
            {text}
          </p>

          {/* Rationale for decisions */}
          {metadata.rationale && metadata.rationale !== 'not stated' ? (
            <div className="flex items-start gap-2 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 mt-1">
              <ChatIcon size={14} className="text-blue-400 mt-0.5" />
              <p className="text-xs text-[var(--color-text-secondary)] italic leading-normal font-medium">
                {metadata.rationale}
              </p>
            </div>
          ) : null}

          {/* Blocked by for tasks */}
          {metadata.blocked_by ? (
            <div className="flex items-center gap-2 bg-red-500/5 p-2.5 rounded-xl border border-red-500/10 mt-1">
              <WarningIcon size={14} className="text-red-400" />
              <p className="text-xs text-red-400 font-bold uppercase tracking-wide">
                Blocked by: {metadata.blocked_by}
              </p>
            </div>
          ) : null}
        </div>

        {/* Actions & Date */}
        <div className="flex flex-col items-end gap-3.5 shrink-0">
          <div className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold tracking-wider uppercase">
            {formatDate(date)}
          </div>
          
          <div className="flex gap-2">
            {/* Task completion toggle */}
            {entry_type === 'task' && onUpdate ? (
              <button
                onClick={handleStatusToggle}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] ${
                  metadata.status === 'done'
                    ? 'border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20'
                    : 'border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] bg-white/3 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/5'
                }`}
                title={metadata.status === 'done' ? 'Mark Task Pending' : 'Mark Task Done'}
              >
                {metadata.status === 'done' ? <RefreshIcon size={14} /> : <CheckIcon size={14} />}
              </button>
            ) : null}
            
            {/* Delete button */}
            {onDelete ? (
              <button
                onClick={handleDelete}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] bg-white/3 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                title="Delete Entry"
              >
                <TrashIcon size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Confidence bar for decisions */}
      {entry_type === 'decision' && metadata.confidence != null ? (
        <div className="flex items-center gap-3 bg-white/1.5 p-2.5 rounded-xl border border-white/3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Confidence</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]"
              style={{ width: `${(metadata.confidence || 0) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
            {Math.round((metadata.confidence || 0) * 100)}%
          </span>
        </div>
      ) : null}

      {/* Frequency bar for patterns */}
      {entry_type === 'pattern' && metadata.frequency != null ? (
        <div className="flex items-center gap-3 bg-white/1.5 p-2.5 rounded-xl border border-white/3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Frequency</span>
          <div className="flex items-center gap-1.5 flex-1">
            {Array.from({ length: Math.min(metadata.frequency, 10) }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-[var(--color-pattern)] opacity-80" />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
            ×{metadata.frequency}
          </span>
        </div>
      ) : null}
    </div>
  );
}
