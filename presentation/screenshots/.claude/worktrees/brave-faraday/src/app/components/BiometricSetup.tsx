import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Fingerprint } from 'lucide-react';

export function BiometricSetup() {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSetupBiometric = () => {
    setIsProcessing(true);
    // Simulate biometric setup
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/saleshelpline');
    }, 1500);
  };

  const handleSkip = () => {
    navigate('/saleshelpline');
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center"
      style={{ backgroundColor: '#1A1A1F' }}
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

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center gap-12">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 
            className="text-5xl sm:text-6xl leading-tight"
            style={{ 
              color: 'var(--text-primary)',
              fontWeight: 400,
              letterSpacing: '-0.02em'
            }}
          >
            Think fast,
            <br />
            build faster
          </h1>
          <p 
            className="text-lg"
            style={{ 
              color: 'var(--text-secondary)',
              fontWeight: 400
            }}
          >
            Your Enterprise AI Assistant
          </p>
        </div>

        {/* Setup Card */}
        <div 
          className="w-full rounded-3xl p-8 shadow-xl"
          style={{ 
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {/* Icon Container */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '2px solid var(--brand-blue)',
              }}
            >
              <Fingerprint 
                size={40} 
                strokeWidth={1.5}
                style={{ color: 'var(--brand-blue)' }}
              />
            </div>
          </div>

          {/* Card Title */}
          <h2 
            className="text-2xl mb-3 text-center"
            style={{ 
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          >
            Setup Authentication
          </h2>

          {/* Description */}
          <p 
            className="text-center mb-8"
            style={{ 
              color: 'var(--text-secondary)',
              fontSize: '15px',
              lineHeight: '1.6'
            }}
          >
            Use fingerprint or face recognition for quick and secure access
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            {/* Primary Button - Setup */}
            <button
              onClick={handleSetupBiometric}
              disabled={isProcessing}
              className="w-full px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: 'var(--brand-blue)',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 500,
                border: 'none',
                outline: 'none',
                opacity: isProcessing ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = '#1a8fff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(10, 132, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = 'var(--brand-blue)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isProcessing ? 'Setting up...' : 'Setup Now'}
            </button>

            {/* Secondary Button - Skip */}
            <button
              onClick={handleSkip}
              disabled={isProcessing}
              className="w-full px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '16px',
                fontWeight: 500,
                border: '1px solid var(--border-subtle)',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-blue)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
