import React from 'react';
import { motion } from 'motion/react';

interface SegmentedControlProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  return (
    <div className="inline-flex p-1 rounded-full bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/5 shadow-inner">
      {options.map((option) => {
        const isActive = selected === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`
              relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-active"
                className="absolute inset-0 bg-blue-600 dark:bg-[#0a84ff] rounded-full shadow-md dark:shadow-[0_0_12px_rgba(10,132,255,0.4)]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
