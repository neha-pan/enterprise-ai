import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ChatComposer } from './ChatComposer';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from './AppHeader';

export function LeaveTracking() {
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

  const leaveBalance = [
    { type: 'Casual Leave', available: 8, total: 12, color: 'var(--status-info)' },
    { type: 'Sick Leave', available: 6, total: 10, color: 'var(--status-success)' },
    { type: 'Privilege Leave', available: 12, total: 15, color: 'var(--status-warning)' },
    { type: 'Comp Off', available: 2, total: 5, color: '#8b5cf6' }, // purple-500
  ];

  const upcomingLeaves = [
    { 
      employee: 'Priya Sharma',
      type: 'Casual Leave',
      dates: 'Feb 26-27, 2026',
      status: 'Approved',
      days: 2
    },
    { 
      employee: 'Amit Kumar',
      type: 'Sick Leave',
      dates: 'Feb 28, 2026',
      status: 'Approved',
      days: 1
    },
    { 
      employee: 'Sneha Patel',
      type: 'Privilege Leave',
      dates: 'Mar 3-7, 2026',
      status: 'Pending',
      days: 5
    },
  ];

  const recentRequests = [
    { 
      id: 'LV-2401',
      requestedBy: 'Rahul Ved (You)',
      type: 'Casual Leave',
      dates: 'Mar 10-11, 2026',
      status: 'Pending',
      submittedOn: 'Feb 20, 2026'
    },
    { 
      id: 'LV-2398',
      requestedBy: 'Rahul Ved (You)',
      type: 'Sick Leave',
      dates: 'Feb 15, 2026',
      status: 'Approved',
      submittedOn: 'Feb 14, 2026'
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
          backgroundSize: '24px 24px'
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
              Leave Tracking
            </h1>
            <p 
              className="text-base leading-relaxed text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              Manage your leave requests and team availability
            </p>
          </div>

          {/* Leave Balance */}
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
              Your Leave Balance
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {leaveBalance.map((leave, index) => (
                <div
                  key={index}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="text-base font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {leave.type}
                    </div>
                    <div 
                      className="text-2xl font-semibold"
                      style={{ color: leave.color }}
                    >
                      {leave.available}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div 
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--border-subtle)' }}
                    >
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${(leave.available / leave.total) * 100}%`,
                          backgroundColor: leave.color
                        }}
                      />
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {leave.available} of {leave.total} days remaining
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Team Leaves */}
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
              Upcoming Team Leaves
            </h2>
            
            <div className="flex flex-col gap-3">
              {upcomingLeaves.map((leave, index) => (
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
                        {leave.employee}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {leave.dates} ({leave.days} {leave.days === 1 ? 'day' : 'days'})
                        </span>
                      </div>
                      <span 
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {leave.type}
                      </span>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: leave.status === 'Approved' 
                          ? 'rgba(34, 197, 94, 0.15)' 
                          : 'rgba(245, 158, 11, 0.15)',
                        color: leave.status === 'Approved' 
                          ? 'var(--status-success)' 
                          : 'var(--status-warning)'
                      }}
                    >
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leave Requests */}
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
              Your Recent Requests
            </h2>
            
            <div className="flex flex-col gap-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
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
                          {request.id}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: request.status === 'Approved' 
                              ? 'rgba(34, 197, 94, 0.15)' 
                              : 'rgba(245, 158, 11, 0.15)',
                            color: request.status === 'Approved' 
                              ? 'var(--status-success)' 
                              : 'var(--status-warning)'
                          }}
                        >
                          {request.status === 'Approved' ? <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> : <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                          {request.status}
                        </span>
                      </div>
                      <div 
                        className="text-base mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {request.type}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {request.dates}
                        </span>
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          • Submitted: {request.submittedOn}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            className="rounded-xl p-4 text-center transition-all duration-200"
            style={{
              backgroundColor: 'rgba(10, 132, 255, 0.15)',
              border: '1px solid var(--brand-blue)',
              color: 'var(--brand-blue)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.15)';
            }}
          >
            Request New Leave
          </button>
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
