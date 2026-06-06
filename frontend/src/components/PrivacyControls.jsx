import { useState, useEffect } from 'react';
import { getCollections, clearCollection } from '../lib/api';

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
    decisions: { icon: '⚡', color: 'var(--color-decision)', desc: 'Extracted decisions and their rationale' },
    tasks: { icon: '✅', color: 'var(--color-task)', desc: 'Action items and to-dos' },
    ideas: { icon: '💡', color: 'var(--color-idea)', desc: 'Ideas, hypotheses, and open questions' },
    patterns: { icon: '🔮', color: 'var(--color-pattern)', desc: 'Synthesized recurring themes' },
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

  useEffect(() => { fetchCollections(); }, []);

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Privacy Controls</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Manage what's stored in your semantic memory
        </p>
      </div>

      {/* Summary Card */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">Total Stored Entries</p>
            <p className="text-3xl font-bold gradient-text font-mono">{totalEntries}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--color-text-muted)]">Collections</p>
            <p className="text-3xl font-bold text-[var(--color-text-primary)] font-mono">{collections.length}</p>
          </div>
        </div>
      </div>

      {/* Collection Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="shimmer h-4 rounded w-24" />
              <div className="shimmer h-8 rounded w-16" />
              <div className="shimmer h-3 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map((col) => {
            const meta = collectionMeta[col.name] || { icon: '📦', color: '#888', desc: '' };
            const isConfirming = confirmDelete === col.name;

            return (
              <div key={col.name} className="glass-card p-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold capitalize text-[var(--color-text-primary)]">
                        {col.name}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">{meta.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono" style={{ color: meta.color }}>
                      {col.count}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">entries</p>
                  </div>
                </div>

                {/* Visual bar */}
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: totalEntries > 0 ? `${(col.count / totalEntries) * 100}%` : '0%',
                      backgroundColor: meta.color,
                      opacity: 0.6,
                    }}
                  />
                </div>

                {/* Delete */}
                {isConfirming ? (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
                    <p className="text-xs text-red-400">Delete all {col.count} entries?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-3 py-1 rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleClear(col.name)}
                        disabled={clearing === col.name}
                        className="text-xs px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                      >
                        {clearing === col.name ? 'Clearing...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(col.name)}
                    disabled={col.count === 0}
                    className="w-full text-xs py-2 rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    🗑 Clear Collection
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="glass-card p-4 border-[var(--color-accent-primary)]/10">
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          <strong className="text-[var(--color-text-secondary)]">🔒 Privacy first:</strong> All data is stored in your Qdrant vector database.
          Clearing a collection permanently removes all entries and their embeddings.
          This action cannot be undone.
        </p>
      </div>
    </div>
  );
}
