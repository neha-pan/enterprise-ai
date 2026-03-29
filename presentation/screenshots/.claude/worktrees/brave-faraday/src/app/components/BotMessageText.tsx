import React from 'react';

interface BotMessageTextProps {
  text: string;
  isLoading?: boolean;
}

export function BotMessageText({ text, isLoading = false }: BotMessageTextProps) {
  return (
    <div className="flex justify-start w-full">
      <div className="max-w-[85%]">
        {isLoading ? (
          <p 
            className="text-base leading-relaxed"
            style={{
              background: 'linear-gradient(90deg, var(--text-secondary) 0%, var(--text-primary) 40%, var(--text-secondary) 80%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 2s ease-in-out infinite'
            }}
          >
            {text}
          </p>
        ) : (
          <p 
            className="text-base leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {text}
          </p>
        )}
      </div>

      {/* Keyframe Animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
