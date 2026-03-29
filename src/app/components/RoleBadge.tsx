import React from 'react';

type RoleBadgeTone = 'blue' | 'green' | 'purple';

interface RoleBadgeProps {
  label: string;
  tone: RoleBadgeTone;
  className?: string;
}

const TONE_CLASSES: Record<RoleBadgeTone, string> = {
  blue: 'text-blue-700 dark:text-blue-400 bg-blue-600/10 dark:bg-blue-400/10 border border-blue-600/20 dark:border-blue-400/25',
  green: 'text-green-700 dark:text-green-400 bg-green-600/10 dark:bg-green-400/10 border border-green-600/20 dark:border-green-400/25',
  purple: 'text-purple-700 dark:text-purple-400 bg-purple-600/10 dark:bg-purple-400/10 border border-purple-600/20 dark:border-purple-400/25',
};

export function RoleBadge({ label, tone, className = '' }: RoleBadgeProps) {
  return (
    <span
      className={`text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full ${TONE_CLASSES[tone]} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
