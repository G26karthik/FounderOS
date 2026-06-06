import { useState } from 'react';
import Sidebar from './components/Sidebar';
import VoiceQuery from './components/VoiceQuery';
import Timeline from './components/Timeline';
import PatternInsights from './components/PatternInsights';
import PrivacyControls from './components/PrivacyControls';
import './index.css';

/**
 * FounderOS — Main Application
 * Voice-first AI Chief of Staff for solo founders.
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
    <div className="flex min-h-screen bg-[var(--color-surface-primary)]">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)]" />
            <span className="text-sm text-[var(--color-text-muted)]">
              {activeView === 'query' && 'Ask your Chief of Staff anything'}
              {activeView === 'timeline' && 'Your decision & task history'}
              {activeView === 'patterns' && 'AI-powered pattern analysis'}
              {activeView === 'privacy' && 'Manage your stored data'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              v1.0.0
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {renderView()}
        </div>
      </main>

      {/* Ambient Background Glow */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-[var(--color-accent-primary)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-64 w-80 h-80 bg-[var(--color-accent-secondary)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
