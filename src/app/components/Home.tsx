import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Clock } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { TaskTile } from './TaskTile';
import { ChatComposer } from './ChatComposer';
import { UserMessageBubble } from './UserMessageBubble';
import { BotMessageText } from './BotMessageText';
import { IMPSLimitTrackerCard } from './IMPSLimitTrackerCard';
import { QuickReplyChips } from './QuickReplyChips';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  isLoading?: boolean;
}

type BotResponseStage = 'idle' | 'line1' | 'line2' | 'line3' | 'line4' | 'line5' | 'line6' | 'showChips' | 'showCard';

export function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [botStage, setBotStage] = useState<BotResponseStage>('idle');
  const [showTrackerCard, setShowTrackerCard] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [trackerStatus, setTrackerStatus] = useState<'Submitted' | 'Reviewing' | 'Approved'>('Submitted');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      // Smooth scroll with delay to allow animation
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      }, 100);
    }
  }, [messages, showTrackerCard]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      type: 'user'
    };
    setMessages(prev => [...prev, newMessage]);
    setBotStage('line1');
  };

  // Bot response sequence
  useEffect(() => {
    if (botStage === 'idle') return;

    if (botStage === 'line1') {
      // Add first bot message: "Understood."
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          text: 'Understood.',
          type: 'assistant'
        }]);
        setBotStage('line2');
      }, 450);
      return () => clearTimeout(timer);
    }

    if (botStage === 'line2') {
      // Add second bot message after delay
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          text: 'It seems like your IMPS transaction has failed due to an issue with the limit.',
          type: 'assistant'
        }]);
        setBotStage('line3');
      }, 600);
      return () => clearTimeout(timer);
    }

    if (botStage === 'line3') {
      // Add loading message
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          text: 'Analysing this...',
          type: 'assistant',
          isLoading: true
        }]);
        
        // After 5 seconds, replace loading with first final line
        setTimeout(() => {
          setMessages(prev => {
            // Remove loading message and add first line
            const withoutLoading = prev.filter(m => m.text !== 'Analysing this...');
            return [...withoutLoading, {
              id: `bot-${Date.now()}`,
              text: 'Your IMPS limit is ₹5,00,000. You\'ve already used ₹4,98,500.',
              type: 'assistant'
            }];
          });
          setBotStage('line4');
        }, 5000);
      }, 100);
      return () => clearTimeout(timer);
    }

    if (botStage === 'line4') {
      // Add "Let's increase your limit to solve for this."
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          text: 'Let\'s increase your limit to solve for this.',
          type: 'assistant'
        }]);
        setBotStage('line5');
      }, 600);
      return () => clearTimeout(timer);
    }

    if (botStage === 'line5') {
      // Add "Should I raise a ticket with the concerned team for the same?"
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          text: 'Should I raise a ticket with the concerned team for the same?',
          type: 'assistant'
        }]);
        setBotStage('showChips');
      }, 500);
      return () => clearTimeout(timer);
    }

    if (botStage === 'showChips') {
      // Show quick reply chips
      const timer = setTimeout(() => {
        setShowQuickReplies(true);
        setBotStage('idle');
      }, 300);
      return () => clearTimeout(timer);
    }

    if (botStage === 'showCard') {
      // Show tracker card after brief delay
      const timer = setTimeout(() => {
        setShowTrackerCard(true);
        setBotStage('idle');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [botStage]);

  // Handle quick reply selection
  const handleQuickReply = (reply: string) => {
    if (reply === 'Yes, raise it') {
      // Hide chips
      setShowQuickReplies(false);
      
      // Add user message "Yes"
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        text: 'Yes',
        type: 'user'
      }]);
      
      // Show tracker card in Reviewing state
      setBotStage('showCard');
    } else {
      // Handle "Not now" - just hide chips
      setShowQuickReplies(false);
    }
  };

  // Auto-transition tracker status from Submitted → Reviewing
  useEffect(() => {
    if (showTrackerCard && trackerStatus === 'Submitted') {
      const timer = setTimeout(() => {
        setTrackerStatus('Reviewing');
      }, 2000); // 2 seconds after card appears
      return () => clearTimeout(timer);
    }
  }, [showTrackerCard, trackerStatus]);

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
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ 
          paddingBottom: '120px' // Space for pinned InputTray
        }}
      >
        {/* Centered Container */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
          
          {/* Hero Block */}
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-baseline gap-3 flex-wrap justify-center">
              <span
                className="text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full"
                style={{
                  color: '#1d4ed8',
                  backgroundColor: 'rgba(37,99,235,0.08)',
                  border: '1px solid rgba(37,99,235,0.2)',
                }}
              >
                Sales Manager
              </span>
              <h1
                className="font-sans text-3xl sm:text-4xl md:text-5xl leading-tight"
                style={{ color: 'var(--text-primary)', fontWeight: 400, letterSpacing: '-0.02em' }}
              >
                Afternoon, Rahul
              </h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              rahul.ved@bajaj.finserv.in
            </p>
          </div>

          {/* Task Card */}
          <div 
            className="rounded-2xl p-6 shadow-lg"
            style={{ 
              backgroundColor: 'var(--surface-1)', 
              border: '1px solid var(--border-subtle)' 
            }}
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 
                className="text-xl text-center"
                style={{ color: 'var(--text-primary)' }}
              >
                What you can do next
              </h2>
            </div>

            {/* Task Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TaskTile 
                icon={<FileText size={20} />}
                text="Resolve DO Cases (12 Open)" 
              />
              <TaskTile 
                icon={<Clock size={20} />}
                text="Fix Pending IMPS (3 Pending)" 
              />
              <TaskTile 
                icon={<FileText size={20} />}
                text="Check Pending IMPS Transactions" 
              />
              <TaskTile 
                icon={<FileText size={20} />}
                text="View SLA Risk Queue" 
              />
            </div>
          </div>

          {/* Messages Feed */}
          {messages.length > 0 && (
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    animation: 'slideUpFade 250ms ease-out'
                  }}
                >
                  {message.type === 'user' && (
                    <UserMessageBubble text={message.text} />
                  )}
                  {message.type === 'assistant' && (
                    <BotMessageText text={message.text} isLoading={message.isLoading} />
                  )}
                </div>
              ))}
              
              {/* Quick Reply Chips */}
              {showQuickReplies && (
                <QuickReplyChips onReplySelect={handleQuickReply} />
              )}
              
              {/* IMPS Limit Tracker Card */}
              {showTrackerCard && (
                <div
                  style={{
                    animation: 'slideUpFade 220ms ease-out',
                    display: 'flex'
                  }}
                >
                  <IMPSLimitTrackerCard status={trackerStatus} />
                </div>
              )}
              
              {/* Spacer for ~20% viewport height breathing room */}
              <div 
                ref={messagesEndRef}
                style={{ height: '20vh' }} 
              />
            </div>
          )}
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

      {/* Keyframe Animations */}
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}