import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { ChatComposer } from './ChatComposer';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from './AppHeader';

export function PortfolioMonitoring() {
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

  const metrics = [
    { 
      icon: <DollarSign size={20} />, 
      label: 'Total Portfolio Value', 
      value: '₹45.2 Cr',
      change: '+2.3%',
      trend: 'up'
    },
    { 
      icon: <TrendingUp size={20} />, 
      label: 'Performing Assets', 
      value: '₹38.5 Cr',
      change: '+1.8%',
      trend: 'up'
    },
    { 
      icon: <AlertTriangle size={20} />, 
      label: 'At Risk', 
      value: '₹4.2 Cr',
      change: '+0.5%',
      trend: 'warning'
    },
    { 
      icon: <TrendingDown size={20} />, 
      label: 'NPAs', 
      value: '₹2.5 Cr',
      change: '-0.2%',
      trend: 'down'
    },
  ];

  const accounts = [
    { 
      name: 'Acme Industries Ltd',
      accountId: 'ACC-9824',
      exposure: '₹12.5 Cr',
      status: 'Healthy',
      riskScore: 85
    },
    { 
      name: 'Sunrise Enterprises',
      accountId: 'ACC-9801',
      exposure: '₹8.2 Cr',
      status: 'Watch List',
      riskScore: 65
    },
    { 
      name: 'Global Tech Solutions',
      accountId: 'ACC-9785',
      exposure: '₹6.8 Cr',
      status: 'Healthy',
      riskScore: 92
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
              Portfolio Monitoring
            </h1>
            <p 
              className="text-base leading-relaxed text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              Track and manage your loan portfolio performance
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="rounded-xl p-4 flex flex-col gap-2"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div 
                  style={{ 
                    color: metric.trend === 'up' ? 'var(--status-success)' :
                           metric.trend === 'warning' ? 'var(--status-warning)' :
                           metric.trend === 'down' ? 'var(--status-danger)' :
                           'var(--brand-blue)'
                  }}
                >
                  {metric.icon}
                </div>
                <div 
                  className="text-2xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {metric.value}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {metric.label}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: metric.change.startsWith('+') && metric.trend === 'up' ? 'var(--status-success)' :
                           metric.change.startsWith('+') ? 'var(--status-warning)' :
                           'var(--status-success)'
                  }}
                >
                  {metric.change} this month
                </span>
              </div>
            ))}
          </div>

          {/* Top Accounts */}
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
              Key Accounts Overview
            </h2>
            
            <div className="flex flex-col gap-3">
              {accounts.map((account, index) => (
                <div
                  key={index}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div 
                        className="text-base font-medium mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {account.name}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {account.accountId}
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: account.status === 'Healthy' 
                          ? 'rgba(34, 197, 94, 0.15)' 
                          : 'rgba(245, 158, 11, 0.15)',
                        color: account.status === 'Healthy' 
                          ? 'var(--status-success)' 
                          : 'var(--status-warning)'
                      }}
                    >
                      {account.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span 
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Exposure: 
                      </span>
                      <span 
                        className="text-base font-semibold ml-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {account.exposure}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Risk Score:
                      </span>
                      <div className="flex items-center gap-1">
                        <div 
                          className="h-1.5 w-16 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--border-subtle)' }}
                        >
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${account.riskScore}%`,
                              backgroundColor: account.riskScore >= 80 ? 'var(--status-success)' :
                                               account.riskScore >= 60 ? 'var(--status-warning)' :
                                               'var(--status-danger)'
                            }}
                          />
                        </div>
                        <span 
                          className="text-sm font-medium"
                          style={{ 
                            color: account.riskScore >= 80 ? 'var(--status-success)' :
                                   account.riskScore >= 60 ? 'var(--status-warning)' :
                                   'var(--status-danger)'
                          }}
                        >
                          {account.riskScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Banner */}
          <div 
            className="rounded-xl p-4 flex items-start gap-3"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <AlertTriangle size={20} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: '2px' }} />
            <div className="flex-1">
              <div 
                className="text-base font-medium mb-1"
                style={{ color: 'var(--status-warning)' }}
              >
                3 accounts require attention
              </div>
              <div 
                className="text-sm"
                style={{ color: 'var(--status-warning)' }}
              >
                Review pending items in your risk analysis dashboard
              </div>
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
