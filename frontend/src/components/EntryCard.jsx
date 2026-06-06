/**
 * FounderOS — Entry Card Component
 * Renders a single decision, task, idea, or pattern entry.
 */
export default function EntryCard({ entry, index = 0 }) {
  const { entry_type, text, date, metadata = {} } = entry;

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

  return (
    <div
      className="glass-card p-4 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
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
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                metadata.status === 'blocked' ? 'bg-red-500/10 text-red-400' :
                metadata.status === 'done' ? 'bg-green-500/10 text-green-400' :
                'bg-white/5 text-[var(--color-text-muted)]'
              }`}>
                {metadata.status}
              </span>
            )}
            {metadata.theme && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-text-muted)]">
                {metadata.theme}
              </span>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{text}</p>

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

        {/* Date */}
        <div className="text-xs text-[var(--color-text-muted)] whitespace-nowrap shrink-0">
          {formatDate(date)}
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
