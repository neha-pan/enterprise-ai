import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';

export interface SuggestivePrompt {
  label: string;
  query: string;
}

export interface SuggestiveCategory {
  id: string;
  label: string;
  Icon: React.ElementType;
  prompts: SuggestivePrompt[];
}

interface SuggestiveActionsProps {
  categories: readonly SuggestiveCategory[];
  /** Called on prompt row hover (query) and un-hover (empty string) */
  onHoverPrompt: (query: string) => void;
  /** Called when a prompt row is clicked */
  onSelectPrompt: (query: string) => void;
}

export function SuggestiveActions({ categories, onHoverPrompt, onSelectPrompt }: SuggestiveActionsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCat = categories.find(c => c.id === activeId) ?? null;

  const closePanel = () => {
    setActiveId(null);
    onHoverPrompt('');
  };

  return (
    <>
      {/* Pill category buttons — no container, sits directly below input */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map(cat => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveId(isActive ? null : cat.id); onHoverPrompt(''); }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm transition-colors"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: isActive ? 'var(--surface-2)' : 'transparent',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <cat.Icon size={14} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Prompt panel */}
      {activeCat && (
        <motion.div
          key={activeCat.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <activeCat.Icon size={14} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {activeCat.label}
              </span>
            </div>
            <button
              onClick={closePanel}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Prompt rows */}
          {activeCat.prompts.map((prompt, i) => (
            <button
              key={i}
              className="flex items-center justify-between w-full px-4 py-3.5 text-left text-sm transition-colors"
              style={{
                borderBottom: i < activeCat.prompts.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
                onHoverPrompt(prompt.query);
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                onHoverPrompt('');
              }}
              onClick={() => {
                setActiveId(null);
                onHoverPrompt('');
                onSelectPrompt(prompt.query);
              }}
            >
              <span>{prompt.label}</span>
              <ChevronRight size={14} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
            </button>
          ))}
        </motion.div>
      )}
    </>
  );
}
