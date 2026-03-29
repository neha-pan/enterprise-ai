import React from 'react';
import { Shield, Check } from 'lucide-react';

interface IMPSLimitTrackerCardProps {
  status?: 'Submitted' | 'Reviewing' | 'Approved';
}

export function IMPSLimitTrackerCard({ status = 'Submitted' }: IMPSLimitTrackerCardProps) {
  const steps = ['Submitted', 'Reviewing', 'Approved'];
  const currentStepIndex = steps.indexOf(status);

  // Define colors based on status
  const getStatusColors = () => {
    switch (status) {
      case 'Submitted':
        return {
          pillBg: 'rgba(59, 130, 246, 0.15)',
          pillText: '#60A5FA'
        };
      case 'Reviewing':
        return {
          pillBg: 'rgba(245, 158, 11, 0.15)',
          pillText: '#FBBF24'
        };
      case 'Approved':
        return {
          pillBg: 'rgba(52, 199, 89, 0.15)',
          pillText: '#34C759'
        };
      default:
        return {
          pillBg: 'rgba(59, 130, 246, 0.15)',
          pillText: '#60A5FA'
        };
    }
  };

  const statusColors = getStatusColors();

  return (
    <div
      className="w-[85%] sm:w-[90%] max-w-2xl rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        animation: 'cardReveal 220ms ease-out'
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        {/* Left: Icon */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.12)'
          }}
        >
          <Shield 
            size={16} 
            style={{ 
              color: '#3B82F6',
              strokeWidth: 2.5
            }} 
          />
        </div>

        {/* Right: Status Pill with smooth transitions */}
        <div
          className="px-3 py-1 rounded-full"
          style={{
            backgroundColor: statusColors.pillBg,
            color: statusColors.pillText,
            transition: 'background-color 200ms ease-in-out, color 200ms ease-in-out'
          }}
        >
          <span className="text-sm" style={{ fontWeight: 500 }}>
            {status}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-base mb-4"
        style={{
          color: 'var(--text-primary)',
          fontWeight: 600
        }}
      >
        IMPS Limit Increase Request
      </h3>

      {/* Meta Info */}
      <div
        className="flex flex-col gap-1 mb-4 text-sm"
        style={{
          color: 'rgba(156, 163, 175, 1)', // Light grey
          opacity: 1
        }}
      >
        <div>Ticket ID: #IMPS-48291</div>
        <div>Expected resolution: ~30 mins</div>
      </div>

      {/* Step Progress Indicator */}
      <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          // Get step color
          let stepColor = 'rgba(255, 255, 255, 0.40)'; // Default muted
          if (isCurrent) {
            if (status === 'Submitted') stepColor = '#60A5FA';
            else if (status === 'Reviewing') stepColor = '#FBBF24';
            else if (status === 'Approved') stepColor = '#34C759';
          } else if (isCompleted) {
            stepColor = 'rgba(255, 255, 255, 0.40)'; // Muted for completed
          }

          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className="relative text-xs px-2 py-1 rounded flex items-center gap-1.5"
                style={{
                  color: stepColor,
                  fontWeight: isCurrent ? 600 : 400,
                  backgroundColor: isCurrent
                    ? status === 'Submitted'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : status === 'Reviewing'
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(52, 199, 89, 0.1)'
                    : 'transparent',
                  transition: 'all 200ms ease-out'
                }}
              >
                {/* Checkmark for completed steps */}
                {isCompleted && (
                  <Check 
                    size={10} 
                    style={{ 
                      opacity: 0.6,
                      animation: 'checkmarkFadeIn 150ms ease-out'
                    }} 
                  />
                )}
                
                {step}
                
                {/* Underline for current step */}
                {isCurrent && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '8px',
                      right: '8px',
                      height: '1px',
                      backgroundColor: stepColor,
                      opacity: 0.5,
                      animation: 'underlineGrow 200ms ease-out'
                    }}
                  />
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className="flex-shrink-0"
                  style={{
                    width: '12px',
                    height: '1px',
                    backgroundColor: 'var(--border-subtle)',
                    opacity: isCompleted || isCurrent ? 0.5 : 0.25,
                    transition: 'opacity 200ms ease-out'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes checkmarkFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.6;
          }
        }

        @keyframes underlineGrow {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}