/**
 * FounderOS — Sidebar Navigation
 */
export default function Sidebar({ activeView, onNavigate }) {
  const navItems = [
    { id: 'query', label: 'Ask FounderOS', icon: '🎙️', desc: 'Voice Q&A' },
    { id: 'timeline', label: 'Timeline', icon: '📋', desc: 'All entries' },
    { id: 'patterns', label: 'Patterns', icon: '🧠', desc: 'Weekly insights' },
    { id: 'privacy', label: 'Privacy', icon: '🔒', desc: 'Data controls' },
  ];

  return (
    <aside className="w-64 min-h-screen border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-secondary)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-xl font-bold gradient-text">FounderOS</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">AI Chief of Staff</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-[var(--color-accent-glow)] border border-[var(--color-border-glow)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{item.desc}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <div className="w-2 h-2 rounded-full bg-[var(--color-task)] animate-pulse" />
          <span>Connected</span>
        </div>
      </div>
    </aside>
  );
}
