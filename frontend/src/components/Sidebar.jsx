import React from 'react';
import { MicIcon, TimelineIcon, BrainIcon, LockIcon } from './icons';

/**
 * FounderOS — Sidebar Navigation
 * Refactored to use SVG icons, accessible touch targets, and premium transitions.
 */
export default function Sidebar({ activeView, onNavigate }) {
  const navItems = [
    { id: 'query', label: 'Ask FounderOS', Icon: MicIcon, desc: 'Voice Q&A' },
    { id: 'timeline', label: 'Timeline', Icon: TimelineIcon, desc: 'All entries' },
    { id: 'patterns', label: 'Patterns', Icon: BrainIcon, desc: 'Weekly insights' },
    { id: 'privacy', label: 'Privacy', Icon: LockIcon, desc: 'Data controls' },
  ];

  return (
    <aside className="w-64 min-h-screen border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-secondary)] flex flex-col justify-between select-none">
      <div>
        {/* Logo */}
        <div className="p-6 border-b border-[var(--color-border-subtle)]">
          <h1 className="text-2xl font-black tracking-tight gradient-text">FounderOS</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mt-1">
            AI Chief of Staff
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-3 mt-4">
          <ul className="space-y-1.5" role="menu">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const { Icon } = item;
              return (
                <li key={item.id} role="none">
                  <button
                    onClick={() => onNavigate(item.id)}
                    role="menuitem"
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-250 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] ${
                      isActive
                        ? 'bg-[var(--color-accent-glow)] border border-[var(--color-border-glow)] text-[var(--color-text-primary)] shadow-[0_4px_12px_rgba(99,102,241,0.08)]'
                        : 'text-[var(--color-text-secondary)] border border-transparent hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <Icon 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-muted)]'
                      }`}
                      size={20}
                    />
                    <div>
                      <div className="text-sm font-semibold tracking-wide">{item.label}</div>
                      <div className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Connection Status Indicator */}
      <div className="p-5 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3 px-2 py-1 bg-white/3 rounded-lg border border-white/5 w-fit">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-task)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-task)]"></span>
          </div>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--color-text-muted)]">
            Memory Hub Online
          </span>
        </div>
      </div>
    </aside>
  );
}
