import React, { useState, useEffect } from 'react';
import { getCollections, clearCollection } from '../lib/api';
import { 
  LightningIcon, 
  CheckIcon, 
  IdeaIcon, 
  SparklesIcon, 
  TimelineIcon, 
  TrashIcon, 
  LockIcon, 
  WarningIcon 
} from './icons';

/**
 * FounderOS — Privacy Controls
 * Manage stored data: view collection stats, clear collections.
 */
export default function PrivacyControls() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const collectionMeta = {
    decisions: { Icon: LightningIcon, color: 'var(--color-decision)', desc: 'Extracted decisions and their rationale' },
    tasks: { Icon: CheckIcon, color: 'var(--color-task)', desc: 'Action items and execution to-dos' },
    ideas: { Icon: IdeaIcon, color: 'var(--color-idea)', desc: 'Ideas, hypotheses, and open opportunities' },
    patterns: { Icon: SparklesIcon, color: 'var(--color-pattern)', desc: 'Synthesized recurring themes and habits' },
  };

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const result = await getCollections();
      setCollections(result.collections || []);
    } catch {
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCollections(); 
  }, []);

  const handleClear = async (name) => {
    setClearing(name);
    try {
      await clearCollection(name);
      await fetchCollections();
    } catch (err) {
      console.error('Clear failed:', err);
    } finally {
      setClearing(null);
      setConfirmDelete(null);
    }
  };

  const totalEntries = collections.reduce((sum, c) => sum + (c.count || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">Privacy Controls</h2>
        <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-1">
          Manage, audit, or reset what is stored in your semantic memory collections
        </p>
      </div>

      {/* Summary Card */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-2 gap-4 divide-x divide-[var(--color-border-subtle)]">
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-wider uppercase text-[var(--color-text-muted)]">Total Memory Nodes</p>
            <p className="text-4xl font-black gradient-text font-mono tracking-tight">{totalEntries}</p>
          </div>
          <div className="space-y-1 pl-6">
            <p className="text-xs font-bold tracking-wider uppercase text-[var(--color-text-muted)]">Active Collections</p>
            <p className="text-4xl font-black text-[var(--color-text-primary)] font-mono tracking-tight">{collections.length}</p>
          </div>
        </div>
      </div>

      {/* Collection Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/5 shimmer" />
                  <div className="space-y-2">
                    <div className="h-4 rounded bg-white/5 shimmer w-20" />
                    <div className="h-3 rounded bg-white/5 shimmer w-32" />
                  </div>
                </div>
                <div className="w-10 h-8 rounded bg-white/5 shimmer" />
              </div>
              <div className="h-1.5 rounded-full bg-white/5 shimmer" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {collections.map((col) => {
            const meta = collectionMeta[col.name] || { Icon: TimelineIcon, color: '#64748b', desc: '' };
            const isConfirming = confirmDelete === col.name;
            const { Icon } = meta;

            return (
              <div key={col.name} className="glass-card p-6 flex flex-col justify-between gap-5 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0"
                        style={{ color: meta.color, borderColor: `${meta.color}22`, backgroundColor: `${meta.color}0a` }}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold capitalize text-[var(--color-text-primary)]">
                          {col.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] font-medium leading-normal">{meta.desc}</p>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black font-mono tracking-tight" style={{ color: meta.color }}>
                        {col.count}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">entries</p>
                    </div>
                  </div>

                  {/* Meter Bar */}
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: totalEntries > 0 ? `${(col.count / totalEntries) * 100}%` : '0%',
                        backgroundColor: meta.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>

                {/* Reset Action */}
                {isConfirming ? (
                  <div className="flex flex-col gap-3 pt-3 border-t border-[var(--color-border-subtle)] bg-red-500/3 p-3.5 rounded-2xl border border-red-500/10">
                    <div className="flex items-center gap-2 text-red-400">
                      <WarningIcon size={14} />
                      <p className="text-xs font-bold uppercase tracking-wider">Warning</p>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                      Are you sure you want to permanently clear all {col.count} memory nodes?
                    </p>
                    
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-3.5 py-2 rounded-xl border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleClear(col.name)}
                        disabled={clearing === col.name}
                        className="text-xs px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        {clearing === col.name ? (
                          <>
                            <span className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            <span>Clearing…</span>
                          </>
                        ) : (
                          <>
                            <TrashIcon size={12} />
                            <span>Confirm Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(col.name)}
                    disabled={col.count === 0}
                    className="w-full text-xs font-bold uppercase tracking-wider py-3 rounded-xl border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer min-h-[40px] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-text-secondary)] disabled:hover:border-[var(--color-border-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                  >
                    Clear Collection
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Informative Security Callout */}
      <div className="glass-card p-5 border-[var(--color-accent-primary)]/15 bg-[var(--color-accent-glow)] flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center shrink-0 border border-[var(--color-accent-primary)]/20">
          <LockIcon size={16} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            🔒 Privacy First Guarantee
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">
            All captured transcripts and AI-extracted nodes are securely saved on your dedicated Qdrant vector database cloud cluster. Clearing a memory collection immediately deletes all points and vectors. This action is irreversible and updates the AI context instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
