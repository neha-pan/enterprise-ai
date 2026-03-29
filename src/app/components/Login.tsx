import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, FileCheck, Fingerprint, ScanFace } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [dotCount, setDotCount] = useState(0);

  // Animated ellipsis effect
  useEffect(() => {
    if (isAuthenticating) {
      const interval = setInterval(() => {
        setDotCount(prev => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isAuthenticating]);

  const handleAuthenticate = (method: 'face' | 'fingerprint') => {
    setIsAuthenticating(true);
    
    // Simulate authentication process
    setTimeout(() => {
      login();
      navigate('/home');
    }, 3000);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--bg-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Centered Container */}
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center">
          
          {/* Optional Product Name */}
          <div className="text-center text-base">
            <div 
              className="text-center text-base"
              style={{ 
                color: 'var(--text-secondary)',
                fontWeight: 500,
                letterSpacing: '0.02em',
                marginBottom: '2rem'
              }}
            >
              Bajaj for Enterprise
            </div>
          </div>

          {/* Authentication Action Card */}
          <div 
            className="rounded-2xl p-6 shadow-lg mb-8"
            style={{ 
              backgroundColor: 'var(--surface-1)', 
              border: '1px solid var(--border-subtle)' 
            }}
          >
            <h2 
              className="text-xl mb-6 text-center"
              style={{ color: 'var(--text-primary)' }}
            >
              Set up quick sign-in
            </h2>

            {/* Authentication Options */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAuthenticate('face')}
                disabled={isAuthenticating}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--brand-blue)',
                  color: 'white'
                }}
              >
                <ScanFace size={20} />
                <span>Use Face Authentication</span>
              </button>

              <button
                onClick={() => handleAuthenticate('fingerprint')}
                disabled={isAuthenticating}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ 
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                <Fingerprint size={20} />
                <span>Use Fingerprint Authentication</span>
              </button>
            </div>
          </div>

          {/* Verification Status */}
          {isAuthenticating && (
            <div className="flex flex-col gap-3 mb-8">
              {/* Working Status */}
              <div className="flex items-center gap-3">
                <Sparkles 
                  size={16} 
                  style={{ color: 'white' }}
                />
                <span 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Working
                </span>
              </div>

              {/* Processing Status */}
              <div className="flex items-start gap-3">
                <FileCheck 
                  size={16} 
                  style={{ color: 'var(--text-secondary)' }}
                  className="mt-0.5"
                />
                <span 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Checking biometric authentication for accurate user identification
                  {'.'.repeat(dotCount)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Progress Bar */}
      {isAuthenticating && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: 'var(--surface-1)' }}
        >
          <div 
            className="h-full animate-pulse"
            style={{ 
              backgroundColor: '#10b981',
              width: '100%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
        </div>
      )}
    </div>
  );
}