/**
 * FounderOS — Entry Card Component
 * Renders a single decision, task, idea, or pattern entry.
 */
export default function EntryCard({ entry, index = 0, onDelete, onUpdate }) {
  const { id, entry_type, text, date, metadata = {} } = entry;

  const typeConfig = {
    decision: { icon: '⚡', label: 'Decision', badgeClass: 'badge-decision' },
    task: { icon: '✅', label: 'Task', badgeClass: 'badge-task' },
    idea: { icon: '💡', label: 'Idea', badgeClass: 'badge-idea' },
    pattern: { icon: '🔮', label: 'Pattern', badgeClass: 'badge-pattern' },
  };

  const config = typeConfig[entry_type] || typeConfig.idea;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
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
    if (confirm(`Are you sure you want to delete this ${entry_type} from FounderOS memory?`)) {
      onDelete(collectionMap[entry_type], id);
    }
  };

  return (
    <div
      className="glass-card p-4 animate-fade-in hover:scale-[1.005] hover:border-[var(--color-border-glow)] transition-all duration-300"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type badge + metadata */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badgeClass}`}>
              {config.icon} {config.label}
            </span>
            {metadata.domain && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-text-muted)]">
                {metadata.domain}
              </span>
            )}
            {metadata.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                metadata.status === 'blocked' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                metadata.status === 'done' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                'bg-white/5 text-[var(--color-text-muted)] border border-white/10'
              }`}>
                {metadata.status.replace('_', ' ')}
              </span>
            )}
            {metadata.theme && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-text-muted)]">
                {metadata.theme}
              </span>
            )}
          </div>

          {/* Content */}
          <p className={`text-sm text-[var(--color-text-primary)] leading-relaxed ${entry_type === 'task' && metadata.status === 'done' ? 'line-through opacity-50' : ''}`}>{text}</p>

          {/* Rationale for decisions */}
          {metadata.rationale && metadata.rationale !== 'not stated' && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)] italic">
              💭 {metadata.rationale}
            </p>
          )}

          {/* Blocked by for tasks */}
          {metadata.blocked_by && (
            <p className="mt-2 text-xs text-red-400">
              🚧 Blocked by: {metadata.blocked_by}
            </p>
          )}
        </div>

        {/* Actions & Date */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="text-xs text-[var(--color-text-muted)] font-mono whitespace-nowrap">
            {formatDate(date)}
          </div>
          <div className="flex gap-1.5">
            {/* Task completion toggle */}
            {entry_type === 'task' && onUpdate && (
              <button
                onClick={handleStatusToggle}
                className={`p-1.5 rounded-lg border text-xs transition-all ${
                  metadata.status === 'done'
                    ? 'border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/15'
                    : 'border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-green-400 hover:border-green-500/30'
                }`}
                title={metadata.status === 'done' ? 'Mark Task Pending' : 'Mark Task Done'}
              >
                {metadata.status === 'done' ? '🔄' : '✅'}
              </button>
            )}
            
            {/* Delete button */}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                title="Delete Entry"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confidence bar for decisions */}
      {entry_type === 'decision' && metadata.confidence != null && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Confidence</span>
          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]"
              style={{ width: `${(metadata.confidence || 0) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {Math.round((metadata.confidence || 0) * 100)}%
          </span>
        </div>
      )}

      {/* Frequency bar for patterns */}
      {entry_type === 'pattern' && metadata.frequency != null && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Frequency</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(metadata.frequency, 10) }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[var(--color-pattern)]" />
            ))}
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            ×{metadata.frequency}
          </span>
        </div>
      )}
    </div>
  );
}
