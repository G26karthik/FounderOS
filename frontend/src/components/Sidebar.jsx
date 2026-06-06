import React from 'react';
import { MicIcon, TimelineIcon, BrainIcon, LockIcon } from './icons';

/**
 * FounderOS — Sidebar Navigation
 * Refactored to a floating space-gray card with premium rounded corners.
 */
export default function Sidebar({ activeView, onNavigate }) {
  const navItems = [
    { id: 'query', label: 'Ask FounderOS', Icon: MicIcon, desc: 'Voice Q&A' },
    { id: 'timeline', label: 'Timeline', Icon: TimelineIcon, desc: 'All entries' },
    { id: 'patterns', label: 'Patterns', Icon: BrainIcon, desc: 'Weekly insights' },
    { id: 'privacy', label: 'Privacy', Icon: LockIcon, desc: 'Data controls' },
  ];

  return (
    <aside className="w-64 h-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-subtle)] rounded-2xl flex flex-col justify-between select-none shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl shrink-0">
      <div>
        {/* Logo Section */}
        <div className="p-6 border-b border-[var(--color-border-subtle)]">
          <h1 className="text-2xl font-black tracking-tight gradient-text">FounderOS</h1>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mt-1">
            AI Chief of Staff
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 mt-2">
          <ul className="space-y-2" role="menu">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const { Icon } = item;
              return (
                <li key={item.id} role="none">
                  <button
                    onClick={() => onNavigate(item.id)}
                    role="menuitem"
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer min-h-[48px] focus-visible:ring-1 focus-visible:ring-white/25 ${
                      isActive
                        ? 'bg-white/5 border border-white/10 text-white shadow-[0_4px_12px_rgba(255,255,255,0.02)] font-semibold'
                        : 'text-[var(--color-text-secondary)] border border-transparent hover:bg-white/2 hover:text-white'
                    }`}
                  >
                    <Icon 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-[var(--color-text-muted)]'
                      }`}
                      size={18}
                    />
                    <div>
                      <div className="text-xs font-bold tracking-wide uppercase">{item.label}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Memory Status Indicator */}
      <div className="p-5 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3 px-3 py-2 bg-white/2 rounded-xl border border-white/5 w-fit">
          <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-task)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-task)]"></span>
          </div>
          <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-[var(--color-text-secondary)]">
            Synapse Online
          </span>
        </div>
      </div>
    </aside>
  );
}
