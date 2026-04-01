import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Laptop, Wifi, HardDrive, Shield } from 'lucide-react';
import { ChatComposer } from './ChatComposer';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from './AppHeader';

export function ITServiceDesk() {
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

  const categories = [
    { icon: <Laptop size={20} />, label: 'Hardware Issues', count: 8 },
    { icon: <Wifi size={20} />, label: 'Network Problems', count: 12 },
    { icon: <HardDrive size={20} />, label: 'Software Support', count: 15 },
    { icon: <Shield size={20} />, label: 'Security Access', count: 5 },
  ];

  const tickets = [
    { 
      id: 'IT-5421', 
      title: 'Laptop not connecting to VPN', 
      priority: 'High',
      assignedTo: 'Tech Team A',
      time: '8 min ago' 
    },
    { 
      id: 'IT-5418', 
      title: 'Password reset for CRM access', 
      priority: 'Medium',
      assignedTo: 'Tech Team B',
      time: '15 min ago' 
    },
    { 
      id: 'IT-5415', 
      title: 'Microsoft Office installation', 
      priority: 'Low',
      assignedTo: 'Tech Team A',
      time: '32 min ago' 
    },
  ];

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <AppHeader />

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

      {/* Scrollable Content Area */}
      <div 
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ paddingBottom: '120px' }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
          
          {/* Hero Block */}
          <div className="flex flex-col gap-4">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl leading-tight text-center"
              style={{ color: 'var(--text-primary)' }}
            >
              IT Service Desk
            </h1>
            <p 
              className="text-base leading-relaxed text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              Technical support for all your IT needs
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ color: 'var(--brand-blue)' }}>
                  {category.icon}
                </div>
                <div 
                  className="text-2xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {category.count}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {category.label}
                </div>
              </div>
            ))}
          </div>

          {/* Active Tickets */}
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
              Active Support Tickets
            </h2>
            
            <div className="flex flex-col gap-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {ticket.id}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 
                              ticket.priority === 'High' ? 'rgba(239, 68, 68, 0.15)' :
                              ticket.priority === 'Medium' ? 'rgba(245, 158, 11, 0.15)' :
                              'rgba(34, 197, 94, 0.15)',
                            color: 
                              ticket.priority === 'High' ? 'var(--status-danger)' :
                              ticket.priority === 'Medium' ? 'var(--status-warning)' :
                              'var(--status-success)'
                          }}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <div 
                        className="text-base mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {ticket.title}
                      </div>
                      <div className="flex items-center gap-3">
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Assigned to: {ticket.assignedTo}
                        </span>
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          • {ticket.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
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
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Request New Hardware', 'Software Installation', 'Report Network Issue', 'Access Management'].map((action, index) => (
                <button
                  key={index}
                  className="rounded-lg p-4 text-left transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--brand-blue)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  {action}
                </button>
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
