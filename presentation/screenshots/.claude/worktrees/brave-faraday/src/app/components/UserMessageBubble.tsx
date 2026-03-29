import React from 'react';

interface UserMessageBubbleProps {
  text: string;
}

export function UserMessageBubble({ text }: UserMessageBubbleProps) {
  return (
    <div className="flex justify-end w-full">
      <div
        className="rounded-2xl px-5 py-3 max-w-[85%] shadow-sm"
        style={{
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)'
        }}
      >
        <p className="text-base leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
