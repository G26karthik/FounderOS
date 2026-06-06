import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import VoiceQuery from './components/VoiceQuery';
import Timeline from './components/Timeline';
import PatternInsights from './components/PatternInsights';
import PrivacyControls from './components/PrivacyControls';
import './index.css';

/**
 * FounderOS — Main Application
 * Refactored layout with constrained content width and floating sidebar panels.
 */
export default function App() {
  const [activeView, setActiveView] = useState('query');

  const renderView = () => {
    switch (activeView) {
      case 'query': return <VoiceQuery />;
      case 'timeline': return <Timeline />;
      case 'patterns': return <PatternInsights />;
      case 'privacy': return <PrivacyControls />;
      default: return <VoiceQuery />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-surface-primary)] p-4 gap-6 overflow-hidden">
      {/* Sidebar Panel */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between border-b border-[var(--color-border-subtle)] px-2 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
            <span className="text-xs font-semibold tracking-wide uppercase text-[var(--color-text-muted)]">
              {activeView === 'query' && 'Ask your Chief of Staff anything'}
              {activeView === 'timeline' && 'Your decision & task history'}
              {activeView === 'patterns' && 'AI-powered pattern analysis'}
              {activeView === 'privacy' && 'Manage your stored data'}
            </span>
          </div>
          <span className="text-[10px] font-bold font-mono text-[var(--color-text-muted)] bg-white/3 px-2 py-0.5 rounded-md border border-white/5">
            v1.0.0
          </span>
        </header>

        {/* Scrollable Page Container */}
        <main className="flex-1 overflow-y-auto pr-1 flex justify-center w-full">
          {/* Constrained layout column centered */}
          <div className="max-w-4xl w-full py-4 pb-16 px-4">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Ambient Background Glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
    </div>
  );
}
