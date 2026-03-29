import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, AlertCircle, Info, Mic, Folder, ArrowUp } from 'lucide-react';

// --- Types ---
export interface Step {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface Option {
  id: string;
  label: string;
  description?: string;
}

// --- Icons ---
const Spinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
  >
    <Loader2 className="w-4 h-4 text-[#0a84ff]" />
  </motion.div>
);

const CheckIcon = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="bg-green-500 rounded-full p-0.5"
  >
    <Check className="w-3 h-3 text-white" />
  </motion.div>
);

// --- Components ---

export const MessageBubble = ({ 
  role, 
  content, 
  typing = false, 
  onTypingComplete 
}: { 
  role: 'user' | 'assistant'; 
  content: React.ReactNode; 
  typing?: boolean;
  onTypingComplete?: () => void;
}) => {
  const isUser = role === 'user';
  const [displayedContent, setDisplayedContent] = useState('');
  
  useEffect(() => {
    if (typing && typeof content === 'string' && !isUser) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedContent((prev) => content.slice(0, index + 1));
        index++;
        if (index === content.length) {
          clearInterval(interval);
          onTypingComplete?.();
        }
      }, 20); // Fast typing speed
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(typeof content === 'string' ? content : '');
      if (!typing) onTypingComplete?.();
    }
  }, [content, typing, isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
          isUser
            ? 'bg-[#0a84ff] text-white rounded-br-none'
            : 'bg-[#2d2d33] text-gray-100 rounded-bl-none border border-white/5'
        }`}
      >
        {typeof content === 'string' ? (typing && !isUser ? displayedContent : content) : content}
      </div>
    </motion.div>
  );
};

export const ProgressCard = ({ 
  title, 
  steps, 
  expanded = true 
}: { 
  title: string; 
  steps: Step[]; 
  expanded?: boolean; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full bg-[#1a1a1f] border border-white/10 rounded-xl overflow-hidden mb-4 shadow-lg"
    >
      <div className="px-4 py-3 border-b border-white/5 bg-[#242429] flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
          {steps.some(s => s.status === 'running') && <Spinner />}
          {title}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="p-4 space-y-3"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {step.status === 'completed' && <CheckIcon />}
                  {step.status === 'running' && <Spinner />}
                  {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-white/20" />}
                  {step.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
                <span className={`text-sm ${
                  step.status === 'running' ? 'text-[#0a84ff] font-medium' : 
                  step.status === 'completed' ? 'text-green-400' : 
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const QuickActionGrid = ({ 
  actions, 
  onActionClick,
  delay = 0
}: { 
  actions: { id: string; label: string; icon?: React.ReactNode; priority?: boolean; count?: number }[]; 
  onActionClick: (id: string) => void; 
  delay?: number;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay }}
      className="bg-[#242429] rounded-xl border border-white/5 p-5 shadow-lg mb-6"
    >
      <h3 className="text-sm font-medium text-gray-500 mb-4">What you can do next</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + (index * 0.08) }}
            onClick={() => onActionClick(action.id)}
            className="group relative p-4 bg-[#1a1a1f] border border-white/5 rounded-md text-left transition-all active:scale-[0.98] hover:bg-[#2d2d33] hover:shadow-md hover:border-[#0a84ff]/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[#0a84ff] group-hover:scale-110 transition-transform origin-left">
                {action.icon || <Info size={20} />}
              </div>
              {action.priority && action.count && (
                <div className="w-[18px] h-[18px] rounded-full bg-[#0a84ff] flex items-center justify-center text-[10px] font-bold text-white">
                  {action.count}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-200 block">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export const DiagnosisOption = ({ 
  option, 
  selected, 
  onSelect 
}: { 
  option: Option; 
  selected: boolean; 
  onSelect: () => void; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
      className={`
        relative p-4 rounded-xl border cursor-pointer transition-all duration-200 mb-3
        ${selected 
          ? 'bg-[#0a84ff]/10 border-[#0a84ff] shadow-[0_0_0_1px_#0a84ff]' 
          : 'bg-[#242429] border-white/5 hover:bg-[#2d2d33]'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`
          mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors
          ${selected ? 'border-[#0a84ff] bg-[#0a84ff]' : 'border-gray-500 bg-transparent'}
        `}>
          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-200'}`}>
            {option.label}
          </h4>
          {option.description && (
            <p className="text-xs text-gray-400 mt-1">{option.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const InputArea = ({ 
  value, 
  onChange, 
  onSend, 
  placeholder = "Describe your issue...",
  disabled = false,
  delay = 0
}: { 
  value: string; 
  onChange: (val: string) => void; 
  onSend: () => void; 
  placeholder?: string;
  disabled?: boolean;
  delay?: number;
}) => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0">
      <motion.div 
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.24, ease: "easeOut", delay: delay }}
        className="relative bg-[#242429] rounded-[20px] p-4 flex items-center gap-3 shadow-xl border border-white/5 transition-all focus-within:ring-1 focus-within:ring-[#0a84ff]/20 focus-within:border-[#0a84ff]/30"
      >
        {/* Folder Icon */}
        <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
          <Folder size={20} />
        </button>

        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-base text-[#f5f5f7] placeholder:text-gray-500/70 outline-none h-6"
        />

        {/* Mic Icon */}
        <button 
          onClick={() => setIsRecording(!isRecording)}
          className={`transition-colors p-2 rounded-full hover:bg-white/5 group relative ${isRecording ? 'text-[#0a84ff]' : 'text-gray-400 hover:text-[#0a84ff]'}`}
        >
          <Mic size={20} className="relative z-10" />
          {isRecording && (
             <motion.div
               layoutId="mic-pulse"
               className="absolute inset-0 bg-[#0a84ff]/20 rounded-full"
               initial={{ scale: 1, opacity: 0.5 }}
               animate={{ scale: 1.5, opacity: 0 }}
               transition={{ duration: 1.2, repeat: Infinity }}
             />
          )}
        </button>

        {/* Primary CTA (Send) */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className={`w-11 h-11 flex items-center justify-center rounded-[14px] shadow-lg transition-all ${
            value.trim() && !disabled 
              ? 'bg-[#0a84ff] text-white hover:shadow-[#0a84ff]/25' 
              : 'bg-white/5 text-gray-500 cursor-not-allowed opacity-30'
          }`}
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </motion.button>
      </motion.div>
    </div>
  );
};
