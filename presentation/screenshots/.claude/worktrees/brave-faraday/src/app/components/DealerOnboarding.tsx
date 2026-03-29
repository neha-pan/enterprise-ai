import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, FileCheck, Clock, AlertCircle } from 'lucide-react';
import { SegmentedControl } from './SegmentedControl';
import { ChatComposer } from './ChatComposer';
import { useAuth } from '../context/AuthContext';

export function DealerOnboarding() {
  const [selectedTab, setSelectedTab] = useState('Onboarding');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSendMessage = (text: string) => {
    console.log('Message sent:', text);
  };

  const onboardingSteps = [
    { 
      step: 1, 
      title: 'Basic Information', 
      status: 'completed',
      icon: <FileCheck size={20} />
    },
    { 
      step: 2, 
      title: 'KYC Documents', 
      status: 'in-progress',
      icon: <Clock size={20} />
    },
    { 
      step: 3, 
      title: 'Agreement Signing', 
      status: 'pending',
      icon: <AlertCircle size={20} />
    },
    { 
      step: 4, 
      title: 'Account Activation', 
      status: 'pending',
      icon: <UserPlus size={20} />
    },
  ];

  const pendingDealers = [
    { name: 'Rajesh Motors Pvt Ltd', region: 'Mumbai West', stage: 'KYC Verification', days: 2 },
    { name: 'Sharma Auto Dealers', region: 'Delhi NCR', stage: 'Document Review', days: 5 },
    { name: 'Coastal Vehicles Inc', region: 'Bangalore South', stage: 'Agreement Draft', days: 1 },
  ];

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col"
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

      {/* Scrollable Content Area */}
      <div 
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ paddingBottom: '120px' }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
          
          {/* Top Segmented Control */}
          <div className="flex justify-center pt-4">
            <SegmentedControl
              options={['Onboarding', 'Pending', 'Completed']}
              selected={selectedTab}
              onChange={setSelectedTab}
            />
          </div>

          {/* Hero Block */}
          <div className="flex flex-col gap-4">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl leading-tight text-center"
              style={{ color: 'var(--text-primary)' }}
            >
              Dealer Onboarding
            </h1>
            <p 
              className="text-base leading-relaxed text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              Manage new dealer registrations and onboarding process
            </p>
          </div>

          {/* Onboarding Progress */}
          <div 
            className="rounded-2xl p-6 shadow-lg"
            style={{ 
              backgroundColor: 'var(--surface-1)', 
              border: '1px solid var(--border-subtle)' 
            }}
          >
            <h2 
              className="text-xl mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Onboarding Pipeline
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {onboardingSteps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl p-4 flex flex-col gap-3"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      style={{ 
                        color: item.status === 'completed' ? '#4ADE80' :
                               item.status === 'in-progress' ? '#F59E0B' :
                               'var(--text-secondary)'
                      }}
                    >
                      {item.icon}
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: item.status === 'completed' 
                          ? 'rgba(34, 197, 94, 0.15)' 
                          : item.status === 'in-progress'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(255, 255, 255, 0.06)',
                        color: item.status === 'completed' 
                          ? '#4ADE80' 
                          : item.status === 'in-progress'
                          ? '#F59E0B'
                          : 'var(--text-secondary)'
                      }}
                    >
                      Step {item.step}
                    </span>
                  </div>
                  <div 
                    className="text-base font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Dealers */}
          <div 
            className="rounded-2xl p-6 shadow-lg"
            style={{ 
              backgroundColor: 'var(--surface-1)', 
              border: '1px solid var(--border-subtle)' 
            }}
          >
            <h2 
              className="text-xl mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Pending Approvals (3)
            </h2>
            
            <div className="flex flex-col gap-3">
              {pendingDealers.map((dealer, index) => (
                <div
                  key={index}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div 
                        className="text-base font-medium mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {dealer.name}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {dealer.region}
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#F59E0B'
                      }}
                    >
                      {dealer.days} days
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {dealer.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Input Tray */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-20"
        style={{ 
          backgroundColor: 'var(--bg-base)',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <ChatComposer onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
