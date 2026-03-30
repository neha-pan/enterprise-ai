import React from 'react';

interface QuickReplyChipsProps {
  onReplySelect: (reply: string) => void;
}

export function QuickReplyChips({ onReplySelect }: QuickReplyChipsProps) {
  return (
    <div
      className="flex items-center gap-3 w-[85%] sm:w-[90%] max-w-2xl"
      style={{ animation: 'slideUpFade 200ms ease-out' }}
    >
      <button
        onClick={() => onReplySelect('Yes, raise it')}
        className="px-4 py-2 rounded-full transition-all duration-150 text-[15px] font-medium bg-[rgba(59,130,246,0.1)] hover:bg-[rgba(59,130,246,0.2)] active:scale-[0.96]"
        style={{ color: 'var(--brand-blue)' }}
      >
        Yes, raise it
      </button>

      <button
        onClick={() => onReplySelect('Not now')}
        className="px-4 py-2 rounded-full transition-all duration-150 text-[15px] font-medium hover:opacity-80 active:scale-[0.96]"
        style={{
          backgroundColor: 'var(--surface-2)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        Not now
      </button>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
