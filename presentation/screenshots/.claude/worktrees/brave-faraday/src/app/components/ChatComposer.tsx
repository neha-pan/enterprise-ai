import React, { useState, useEffect } from 'react';
import { Folder, Plus, ArrowRight, Mic, X, Loader2 } from 'lucide-react';

type InputTrayVariant = 'default' | 'recording' | 'transcribing' | 'transcriptReady';

interface ChatComposerProps {
  onSendMessage?: (message: string) => void;
}

export function ChatComposer({ onSendMessage }: ChatComposerProps) {
  const [variant, setVariant] = useState<InputTrayVariant>('default');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>([
    30, 45, 35, 50, 40, 55, 38, 48, 42, 52, 36, 46
  ]);
  const [gradientOffset, setGradientOffset] = useState(0);

  // Timer - count up from 0 to 60 seconds
  useEffect(() => {
    if (variant !== 'recording') return;

    const timerInterval = setInterval(() => {
      setRecordingSeconds(prev => {
        if (prev >= 60) {
          // Auto-stop at 60 seconds → go to transcribing
          setVariant('transcribing');
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [variant]);

  // Waveform animation - continuous loop every 300ms
  useEffect(() => {
    if (variant !== 'recording') return;

    const waveInterval = setInterval(() => {
      setWaveHeights(prev => prev.map(() => Math.random() * 40 + 20));
    }, 300);

    return () => clearInterval(waveInterval);
  }, [variant]);

  // Transcribing gradient animation - moving sheen effect
  useEffect(() => {
    if (variant !== 'transcribing') return;

    const gradientInterval = setInterval(() => {
      setGradientOffset(prev => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(gradientInterval);
  }, [variant]);

  // Auto-transition from Transcribing to TranscriptReady
  useEffect(() => {
    if (variant !== 'transcribing') return;

    const transcribingTimer = setTimeout(() => {
      setVariant('transcriptReady');
    }, 2000); // 2 seconds delay

    return () => clearTimeout(transcribingTimer);
  }, [variant]);

  const handleStartRecording = () => {
    setVariant('recording');
    setRecordingSeconds(0);
  };

  const handleStopRecording = () => {
    setVariant('transcribing');
    setRecordingSeconds(0);
  };

  const handleCancel = () => {
    setVariant('default');
    setRecordingSeconds(0);
  };

  const handleSend = () => {
    if (variant === 'transcriptReady' && onSendMessage) {
      const message = "IMPS fail ho raha hai Raj Motors ka limit error aa raha";
      onSendMessage(message);
      setVariant('default');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="rounded-2xl p-4 shadow-lg transition-all"
      style={{ 
        backgroundColor: 'var(--surface-1)', 
        border: '1px solid var(--border-subtle)',
        transitionDuration: variant === 'recording' ? '250ms' : '200ms',
        transitionTimingFunction: variant === 'recording' ? 'ease-out' : 'ease-in'
      }}
    >
      {/* Variant A - Default */}
      {variant === 'default' && (
        <div
          style={{
            animation: 'fadeIn 200ms ease-in'
          }}
        >
          <input
            type="text"
            placeholder="Chat with your Bajaj AI assistant"
            className="w-full bg-transparent border-none outline-none mb-3 px-2 py-2 pointer-events-none"
            style={{ color: 'var(--text-primary)' }}
            readOnly
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                <Folder size={20} />
              </button>
              <button className="p-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
                onClick={handleStartRecording}
              >
                <Mic size={16} />
              </button>
              <button 
                className="p-2.5 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-blue)', color: '#fff' }}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variant B - Recording */}
      {variant === 'recording' && (
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-2xl"
          style={{
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            animation: 'fadeIn 250ms ease-out'
          }}
        >
          {/* Cancel Button (X) */}
          <button
            onClick={handleCancel}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ 
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={18} />
          </button>

          {/* Waveform - Tap to stop */}
          <div 
            className="flex items-center justify-center gap-1 flex-1 h-9 cursor-pointer"
            onClick={handleStopRecording}
          >
            {waveHeights.map((height, index) => (
              <div
                key={index}
                className="rounded-full transition-all"
                style={{
                  width: index % 4 === 0 ? '3px' : '2px',
                  height: `${height}%`,
                  backgroundColor: 'var(--text-primary)',
                  opacity: 0.9,
                  transitionDuration: '300ms',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            ))}
          </div>

          {/* Timer */}
          <div 
            className="text-sm font-mono flex-shrink-0 tabular-nums"
            style={{ 
              color: 'var(--text-secondary)',
              minWidth: '40px',
              textAlign: 'right'
            }}
          >
            {formatTime(recordingSeconds)}
          </div>
        </div>
      )}

      {/* Variant C - Transcribing */}
      {variant === 'transcribing' && (
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-2xl"
          style={{
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            animation: 'fadeIn 250ms ease-out'
          }}
        >
          {/* Cancel Button (X) */}
          <button
            onClick={handleCancel}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ 
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={18} />
          </button>

          {/* Transcribing Text with Gradient Animation */}
          <div className="flex-1 text-center">
            <span
              className="text-sm"
              style={{
                backgroundImage: `linear-gradient(90deg, 
                  var(--text-secondary) ${gradientOffset * 33}%, 
                  var(--text-primary) ${gradientOffset * 33 + 15}%, 
                  var(--text-secondary) ${gradientOffset * 33 + 30}%)`,
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transition: 'background-position 300ms ease-in-out'
              }}
            >
              Transcribing…
            </span>
          </div>

          {/* Loader Button */}
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ 
              backgroundColor: 'var(--brand-blue)',
              color: '#fff'
            }}
          >
            <Loader2 size={16} className="animate-spin" />
          </button>
        </div>
      )}

      {/* Variant D - Transcript Ready */}
      {variant === 'transcriptReady' && (
        <div
          style={{
            animation: 'fadeIn 200ms ease-in'
          }}
        >
          <input
            type="text"
            value="IMPS fail ho raha hai Raj Motors ka limit error aa raha"
            className="w-full bg-transparent border-none outline-none mb-3 px-2 py-2 pointer-events-none"
            style={{ color: 'var(--text-primary)' }}
            readOnly
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                <Folder size={20} />
              </button>
              <button className="p-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
                onClick={handleStartRecording}
              >
                <Mic size={16} />
              </button>
              <button 
                className="p-2.5 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-blue)', color: '#fff' }}
                onClick={handleSend}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}