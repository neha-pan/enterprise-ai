import React from 'react';

export interface NextActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NextActionsCardProps {
  actions: NextActionItem[];
  onActionClick?: (id: string) => void;
}

export function NextActionsCard({ actions, onActionClick }: NextActionsCardProps) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
    >
      <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
        What you can do next
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onActionClick?.(action.id)}
            className="w-full min-h-[56px] flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:opacity-85 active:scale-[0.98] cursor-pointer"
            style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="shrink-0" style={{ color: 'var(--brand-blue)' }}>
              {action.icon}
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
