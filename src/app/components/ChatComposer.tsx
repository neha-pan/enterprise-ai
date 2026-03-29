import React, { useState, useEffect, useRef } from 'react';
import { Plus, Mic, ArrowUp, X, Loader2, Paperclip, Image as ImageIcon, Home } from 'lucide-react';

type InputTrayVariant = 'default' | 'recording' | 'transcribing' | 'transcriptReady';

interface ChatComposerProps {
  placeholder?: string;
  disabled?: boolean;
  onSendMessage?: (message: string) => void;
  /** External value that pre-fills the input (e.g. on prompt hover). Clears when set to empty string. */
  prefillValue?: string;
  /** When provided, shows a "New conversation" item in the + menu that returns to the home screen. */
  onNewConversation?: () => void;
}

const TRANSCRIPT_TEXT = 'IMPS fail ho raha hai Raj Motors ka limit error aa raha';

// Bell-curve height envelope for 16 bars — integer px values, no sub-pixel blur
const BAR_PROFILE = [
  { min: 3, max: 8  },
  { min: 3, max: 11 },
  { min: 3, max: 15 },
  { min: 3, max: 19 },
  { min: 3, max: 23 },
  { min: 3, max: 27 },
  { min: 4, max: 30 },
  { min: 4, max: 32 },
  { min: 4, max: 32 },
  { min: 4, max: 30 },
  { min: 3, max: 27 },
  { min: 3, max: 23 },
  { min: 3, max: 19 },
  { min: 3, max: 15 },
  { min: 3, max: 11 },
  { min: 3, max: 8  },
];

// Center bars → brand blue; edges → text-secondary
const getBarColor = (i: number): string => {
  const center = (BAR_PROFILE.length - 1) / 2;
  const distance = Math.abs(i - center) / center;
  if (distance < 0.25) return '#2563eb';
  if (distance < 0.55) return 'rgba(37,99,235,0.55)';
  return 'var(--text-secondary)';
};

export function ChatComposer({
  placeholder = "Chat with your Bajaj AI assistant... (e.g., 'What is my leave balance?')",
  disabled = false,
  onSendMessage,
  prefillValue,
  onNewConversation,
}: ChatComposerProps) {
  const [variant, setVariant] = useState<InputTrayVariant>('default');
  const [text, setText] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Sync external prefill (e.g. from prompt hover) into input
  useEffect(() => {
    if (prefillValue !== undefined) setText(prefillValue);
  }, [prefillValue]);

  // Close plus menu on outside click
  useEffect(() => {
    if (!showPlusMenu) return;
    const handler = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPlusMenu]);

  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Recording timer
  useEffect(() => {
    if (variant !== 'recording') return;
    const t = setInterval(() => {
      setRecordingSeconds(prev => {
        if (prev >= 60) { setVariant('transcribing'); return 0; }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [variant]);

  // Auto-transition transcribing → transcriptReady
  useEffect(() => {
    if (variant !== 'transcribing') return;
    const t = setTimeout(() => setVariant('transcriptReady'), 2000);
    return () => clearTimeout(t);
  }, [variant]);

  const handleSend = () => {
    const val = text.trim();
    if (!val || disabled) return;
    onSendMessage?.(val);
    setText('');
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div
      className="rounded-2xl shadow-lg transition-all"
      style={{
        backgroundColor: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* ── Default ─────────────────────────────────────────────────────── */}
      {variant === 'default' && (
        <div
          className="flex items-center gap-2 px-4 py-3.5"
          style={{ animation: 'composerFadeIn 200ms ease-in' }}
        >
          {/* Plus button + dropdown */}
          <div ref={plusMenuRef} className="relative shrink-0">
            <button
              onClick={() => setShowPlusMenu(v => !v)}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Attach"
            >
              <Plus size={20} />
            </button>
            {showPlusMenu && (
              <div
                className="absolute bottom-full left-0 mb-2 rounded-xl border py-1 min-w-[176px] z-50"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                }}
              >
                {[
                  { Icon: Paperclip, label: 'Add a file' },
                  { Icon: ImageIcon, label: 'Upload an image' },
                ].map(({ Icon, label }) => (
                  <button
                    key={label}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm text-left transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                    onClick={() => setShowPlusMenu(false)}
                  >
                    <Icon size={15} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
                    {label}
                  </button>
                ))}
                {onNewConversation && (
                  <>
                    <div className="my-1 mx-3" style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                    <button
                      className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm text-left transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                      onClick={() => { setShowPlusMenu(false); onNewConversation(); }}
                    >
                      <Home size={15} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
                      New conversation
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <input
            type="text"
            value={text}
            onChange={e => !disabled && setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm"
            style={{
              color: 'var(--text-primary)',
              caretColor: 'var(--text-primary)',
            }}
          />

          <button
            disabled={disabled}
            onClick={() => !disabled && setVariant('recording')}
            className="shrink-0 p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Mic size={20} />
          </button>

          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              backgroundColor:
                text.trim() && !disabled ? 'var(--status-info)' : 'var(--surface-2)',
              color:
                text.trim() && !disabled ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ── Recording ────────────────────────────────────────────────────── */}
      {variant === 'recording' && (
        <div
          className="flex flex-col px-4 py-3"
          style={{ animation: 'composerFadeIn 250ms ease-out' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setVariant('default'); setRecordingSeconds(0); }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity shrink-0"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>

            {/* Waveform — CSS-animated, GPU-driven, no JS re-renders */}
            <div
              className="flex items-center justify-center gap-[2px] flex-1 cursor-pointer"
              style={{
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(37,99,235,0.04)',
                animation: 'glowPulse 2s ease-in-out infinite',
              }}
              onClick={() => setVariant('transcribing')}
            >
              {BAR_PROFILE.map((bar, i) => (
                <div
                  key={i}
                  style={{
                    width: '2px',
                    height: `${bar.min}px`,
                    borderRadius: '1px',
                    backgroundColor: getBarColor(i),
                    animationName: 'barPulse',
                    animationDuration: '1s',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${i * 62}ms`,
                    animationFillMode: 'both',
                    willChange: 'height',
                    '--bar-min': `${bar.min}px`,
                    '--bar-max': `${bar.max}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            <div
              className="text-sm font-mono shrink-0 tabular-nums"
              style={{ color: 'var(--text-secondary)', minWidth: '40px', textAlign: 'right' }}
            >
              {formatTime(recordingSeconds)}
            </div>
          </div>

          {/* Listening label */}
          <div className="flex items-center justify-center gap-1.5 mt-2 mb-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: '#ef4444', animation: 'recDotPulse 1.4s ease-in-out infinite' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Listening…
            </span>
          </div>
        </div>
      )}

      {/* ── Transcribing ─────────────────────────────────────────────────── */}
      {variant === 'transcribing' && (
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ animation: 'composerFadeIn 250ms ease-out' }}
        >
          <button
            onClick={() => setVariant('default')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity shrink-0"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>

          <div className="flex-1" />

          <button
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--status-info)', color: '#fff' }}
          >
            <Loader2 size={16} className="animate-spin" />
          </button>
        </div>
      )}

      {/* ── Transcript ready ──────────────────────────────────────────────── */}
      {variant === 'transcriptReady' && (
        <div
          className="flex items-center gap-2 px-4 py-3.5"
          style={{ animation: 'composerFadeIn 200ms ease-in' }}
        >
          <button
            className="shrink-0 p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Plus size={20} />
          </button>

          <span
            className="flex-1 min-w-0 truncate text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            {TRANSCRIPT_TEXT}
          </span>

          <button
            onClick={() => setVariant('recording')}
            className="shrink-0 p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Mic size={20} />
          </button>

          <button
            onClick={() => { onSendMessage?.(TRANSCRIPT_TEXT); setVariant('default'); }}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ backgroundColor: 'var(--status-info)', color: '#fff' }}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes composerFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes barPulse {
          0%, 100% { height: var(--bar-min); }
          50%       { height: var(--bar-max); }
        }

        @keyframes glowPulse {
          0%, 100% { background-color: rgba(37,99,235,0.03); }
          50%       { background-color: rgba(37,99,235,0.07); }
        }

        @keyframes recDotPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
