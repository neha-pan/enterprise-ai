import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Fingerprint, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function BiometricSetup() {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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

  const handleThemeToggle = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Title bar */}
      <header
        className="relative z-20 w-full flex items-center px-6"
        style={{
          height: '80px',
          backgroundColor: 'var(--surface-1)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <svg width="101" height="42" viewBox="0 0 67 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_bio_logo)">
            <path d="M47.0768 12.8024L45.0721 16.2943H43.3262L46.1391 11.7031H48.0467L50.8273 16.2943H49.0814L48.5964 15.486H46.0098L46.4301 14.7747C46.5271 14.6131 46.7211 14.5161 46.9151 14.5161H48.0467L47.0768 12.8024Z" fill="#005DAC"/>
            <path d="M37.1826 11.7031H35.6953V16.2943H37.1826V11.7031Z" fill="#005DAC"/>
            <path d="M41.3544 11.7031V14.2897L39.5761 11.7031H37.7979V16.2943H39.2851V13.7401L39.3175 13.7724L41.0311 16.2943H42.8417V11.7031H41.3544Z" fill="#005DAC"/>
            <path d="M54.8368 11.7031V14.2897L53.0908 11.7031H51.3125V16.2943H52.7998V13.7401V13.7724L54.5458 16.2943H56.324V11.7031H54.8368Z" fill="#005DAC"/>
            <path d="M30.7168 11.7031V16.2943H30.9108H32.2041V14.4514H33.4974C33.7884 14.4514 33.8854 14.2574 33.8854 14.2574L34.338 13.5137H32.2041V13.2228C32.2364 12.6731 32.7537 12.6731 32.7537 12.6731H34.3057C34.629 12.6731 34.726 12.5114 34.726 12.5114L35.211 11.7355H30.7168V11.7031Z" fill="#005DAC"/>
            <path d="M63.8253 13.2551V13.5137H65.9592L65.5066 14.2574C65.5066 14.2574 65.4096 14.4514 65.1186 14.4514H63.8576V14.8717C63.8576 14.8717 63.8576 14.904 63.8576 14.9687C63.9223 15.195 64.1486 15.3567 64.375 15.3567H66.2179H66.6059V16.2943H62.3057V11.7031H66.6059V12.6408H64.375C64.084 12.6731 63.8253 12.9318 63.8253 13.2551Z" fill="#005DAC"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M56.8086 13.9664C56.8086 13.9987 56.8086 14.0311 56.8086 14.0311C56.8086 14.3867 56.8733 14.7101 57.0026 15.0334C57.1319 15.3567 57.2936 15.6154 57.4876 15.8417C57.5199 15.874 57.5199 15.874 57.5522 15.9064C57.9079 16.262 58.5222 16.2943 58.9749 16.2943H61.8201L61.4645 15.583C61.4322 15.5184 61.3675 15.4537 61.3028 15.389C61.2382 15.3567 61.1735 15.3244 61.0765 15.3244H60.1388C59.3952 15.3244 58.2959 15.2597 58.2959 14.0311V13.9987V13.9664C58.2959 12.7378 59.4275 12.6731 60.1388 12.6731H61.0765C61.1412 12.6731 61.2382 12.6408 61.3028 12.6084C61.3675 12.5761 61.4322 12.5114 61.4645 12.4144L61.8201 11.7031H58.9749C58.4899 11.7031 57.9079 11.7355 57.5522 12.0911C57.5199 12.1234 57.5199 12.1234 57.4876 12.1558C57.2936 12.3821 57.0996 12.6731 57.0026 12.9641C56.8733 13.2874 56.8409 13.6431 56.8086 13.9664Z" fill="#005DAC"/>
            <path d="M28 -0.000976562H0V27.999H28V-0.000976562Z" fill="#005DAC"/>
            <path d="M1.55273 26.4469V22.7286H4.85066C5.52964 22.7286 6.62895 22.8256 6.62895 23.6986C6.62895 24.1189 6.24096 24.4422 5.7883 24.5392C6.33795 24.7009 6.62895 25.0242 6.62895 25.4446C6.62895 26.3499 5.5943 26.4469 4.85066 26.4469H1.55273ZM2.74904 24.8949L3.1047 24.3129C3.2017 24.1836 3.33103 24.1189 3.49269 24.1189H4.85066C5.07698 24.1189 5.30331 24.0219 5.30331 23.8279C5.30331 23.6339 5.10932 23.5369 4.85066 23.5369H2.74904V24.8949ZM2.74904 24.8949V26.4792L3.1047 25.8649C3.2017 25.7356 3.33103 25.6709 3.49269 25.6709H4.81832C5.07698 25.6709 5.27098 25.5092 5.27098 25.2829C5.27098 25.0566 5.07698 24.8949 4.81832 24.8949H2.74904ZM9.57121 23.6339L7.92225 26.4792H6.49962L8.79523 22.7286H10.3472L12.6105 26.4469H11.1878L10.7998 25.7679H8.69823L9.05389 25.2182C9.15089 25.0889 9.28022 25.0242 9.44188 25.0242H10.3472L9.57121 23.6339ZM19.4973 23.6339L17.8483 26.4792H16.4257L18.7213 22.7286H20.2733L22.5689 26.4792H21.1463L20.7583 25.8002H18.6567L19.0123 25.2182C19.1093 25.0889 19.2386 25.0242 19.4003 25.0242H20.3056L19.4973 23.6339ZM14.8414 25.6709C15.1324 25.6709 15.3264 25.5416 15.3264 25.2506V22.6963H16.5227V25.3476C16.5227 26.1559 16.0054 26.4145 15.2941 26.4145H13.2895C13.1278 26.4145 12.9985 26.3499 12.9015 26.2205L12.5458 25.6386L14.8414 25.6709ZM24.7352 25.6709C25.0262 25.6709 25.2202 25.5416 25.2202 25.2506V22.6963H26.4165V25.3476C26.4165 26.1559 25.8992 26.4145 25.1878 26.4145H23.1832C23.0216 26.4145 22.8922 26.3499 22.7952 26.2205L22.4396 25.6386L24.7352 25.6709Z" fill="white"/>
            <path d="M14.5179 5.33309C13.354 5.39776 11.9313 5.62409 10.832 5.97974C10.638 6.04441 9.89437 6.27074 10.153 6.59406C10.444 6.94972 11.511 6.62639 11.9313 6.56173C13.1276 6.40007 16.8459 5.85041 16.0699 8.17836C15.8436 8.85734 15.1646 9.60099 14.6796 10.086C14.1299 9.76265 13.1276 9.27767 13.1276 9.27767C12.6103 9.019 12.0607 8.76034 11.511 8.53402C10.9937 8.30769 9.60338 7.69337 9.11839 7.7257C8.66574 7.75803 8.40708 8.11369 8.7304 8.53402C9.0214 8.92201 10.0884 9.407 10.5734 9.66566C10.8967 9.85965 13.16 11.1853 13.1923 11.3469C13.1923 11.4116 13.0306 11.5086 12.966 11.5409C11.899 12.3493 10.7027 12.8989 9.53872 13.5779C9.18306 13.7719 8.37474 14.2245 8.69807 14.7419C9.0214 15.2269 9.92671 14.8065 10.347 14.6772C13.1276 13.6749 17.3309 11.4763 18.8828 8.85734C20.8551 5.62409 16.6195 5.23609 14.5179 5.33309Z" fill="white"/>
            <path d="M19.3027 14.7422C19.1088 13.9662 18.0741 12.6406 17.4598 12.1556C17.4598 12.1556 17.4275 12.1556 17.4275 12.1233C17.4275 12.1233 17.3951 12.0909 17.2981 12.0586L17.2658 12.0909L15.3582 13.3519C15.7785 13.9662 16.2635 14.5159 16.1665 15.3242C16.0372 16.3912 14.2265 16.3912 13.4506 16.3588C12.6099 16.3265 11.7693 16.0678 10.9609 16.0032C10.67 15.9708 9.76464 16.1002 10.2496 16.5205C10.67 16.8761 12.8686 17.2318 13.4829 17.2965C15.1642 17.4905 20.1111 17.6845 19.3027 14.7422Z" fill="white"/>
          </g>
          <defs>
            <clipPath id="clip0_bio_logo">
              <rect width="66.6697" height="28" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        <button
          onClick={handleThemeToggle}
          className="ml-auto flex items-center justify-center w-9 h-9 rounded-lg hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--bg-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px'
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-6 py-12 flex flex-col items-center gap-12">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 
            className="text-5xl sm:text-6xl leading-tight"
            style={{
              color: 'var(--text-primary)',
              fontFamily: "'Lora', serif",
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            Work simpler,
            <br />
            move faster
          </h1>
          <p 
            className="text-lg"
            style={{ 
              color: 'var(--text-secondary)',
              fontWeight: 400
            }}
          >
            Blu, your enterprise AI assistant
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
    </div>
  );
}
