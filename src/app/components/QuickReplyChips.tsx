import React from 'react';

interface QuickReplyChipsProps {
  onReplySelect: (reply: string) => void;
}

export function QuickReplyChips({ onReplySelect }: QuickReplyChipsProps) {
  const handleChipClick = (reply: string) => {
    onReplySelect(reply);
  };

  return (
    <div
      className="flex items-center gap-3 w-[85%] sm:w-[90%] max-w-2xl"
      style={{
        animation: 'slideUpFade 200ms ease-out'
      }}
    >
      {/* Primary Chip - Yes, raise it */}
      <button
        onClick={() => handleChipClick('Yes, raise it')}
        className="px-4 py-2 rounded-full transition-all duration-150"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: 'var(--brand-blue)',
          fontSize: '15px',
          fontWeight: 500,
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.96)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Yes, raise it
      </button>

      {/* Secondary Chip - Not now */}
      <button
        onClick={() => handleChipClick('Not now')}
        className="px-4 py-2 rounded-full transition-all duration-150"
        style={{
          backgroundColor: 'var(--surface-2)',
          color: 'var(--text-secondary)',
          fontSize: '15px',
          fontWeight: 500,
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.96)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
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
