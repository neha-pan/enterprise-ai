import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface TaskTileProps {
  icon?: React.ReactNode;
  text: string;
}

export function TaskTile({ icon, text }: TaskTileProps) {
  return (
    <div 
      className="flex items-center gap-3 p-4 rounded-xl transition-all hover:opacity-80 cursor-pointer"
      style={{ 
        backgroundColor: 'var(--surface-2)', 
        border: '1px solid var(--border-subtle)' 
      }}
    >
      <div style={{ color: 'var(--brand-blue)' }}>
        {icon || <CheckCircle2 size={20} />}
      </div>
      <span style={{ color: 'var(--text-primary)' }}>{text}</span>
    </div>
  );
}
