import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';

export function LoginEntry() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Move to password step with smooth expansion
      setStep('password');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      // Check if email is rahul.ved@gmail.com
      if (email.toLowerCase() === 'rahul.ved@gmail.com') {
        // Navigate to biometric setup screen
        navigate('/biometric-setup');
      } else {
        // Navigate to the quick sign-in screen for other users
        navigate('/quicksignin');
      }
    }
  };

  const handleSubmit = step === 'email' ? handleEmailSubmit : handlePasswordSubmit;

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

        {/* Login Card */}
        <div 
          className="w-full rounded-3xl p-8 shadow-xl transition-all duration-500 ease-in-out"
          style={{ 
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {/* Card Title */}
          <h2 
            className="text-2xl mb-6"
            style={{ 
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          >
            Log in
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                readOnly={step === 'password'}
                className="w-full px-4 py-3.5 rounded-xl transition-all duration-200 outline-none"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                  opacity: step === 'password' ? 0.7 : 1,
                  cursor: step === 'password' ? 'default' : 'text',
                }}
                onFocus={(e) => {
                  if (step === 'email') {
                    e.target.style.borderColor = 'var(--brand-blue)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-subtle)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <style>{`
                input::placeholder {
                  color: var(--text-secondary);
                  opacity: 0.6;
                }
              `}</style>
            </div>

            {/* Password Input - Appears with fade and expansion */}
            <div 
              className="relative overflow-hidden transition-all duration-500 ease-in-out"
              style={{
                maxHeight: step === 'password' ? '64px' : '0px',
                opacity: step === 'password' ? 1 : 0,
              }}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 pr-12 rounded-xl transition-all duration-200 outline-none"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand-blue)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-subtle)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              {/* Password Visibility Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={1.5} />
                ) : (
                  <Eye size={20} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Primary Button */}
            <button
              type="submit"
              className="w-full px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: 'var(--brand-blue)',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 500,
                border: 'none',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a8fff';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(10, 132, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-blue)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
            >
              {step === 'email' ? 'Continue with email' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}