import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Plane, BarChart2, Car, X, BookOpen } from 'lucide-react';
import { ChatComposer } from './ChatComposer';
import { UserMessageBubble } from './UserMessageBubble';
import { BotMessageText } from './BotMessageText';
import { useAuth } from '../context/AuthContext';
import { SuggestiveActions, type SuggestiveCategory } from './SuggestiveActions';
import { RoleBadge } from './RoleBadge';
import { AppShell, type ConversationItem, type UserInfo } from './AppShell';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  isLoading?: boolean;
}

type BotStage = 'idle' | 'line1' | 'line2' | 'line3' | 'done';

const CONVERSATIONS: ConversationItem[] = [
  { id: 1, title: 'Log a Leave', time: 'Just now', active: true, sub: 'In progress' },
  { id: 2, title: 'Book a Cab for Work', time: '2d ago', active: false, sub: 'Completed' },
  { id: 3, title: 'PMS Goal Update', time: '1w ago', active: false, sub: 'Completed' },
];

const USER: UserInfo = {
  name: 'Rita Sharma',
  initials: 'RS',
  role: 'Unit Manager, Pune',
  avatarColor: '#16a34a',
};

const LEAVE_BALANCE = [
  { label: 'Earned Leave', value: '14 days' },
  { label: 'Sick Leave', value: '6 days' },
  { label: 'Casual Leave', value: '3 days' },
];

const RESOURCES = ['HR Policy Handbook', 'Travel & Expense Guide', 'PMS Documentation'];

const EMPLOYEE_CATEGORIES: SuggestiveCategory[] = [
  {
    id: 'leaves',
    label: 'Leaves',
    Icon: Calendar,
    prompts: [
      { label: 'Check my leave balance', query: "What is my current leave balance? Show me earned, sick and casual leave days available." },
      { label: 'Apply for a leave', query: "I want to apply for leave. Can you help me check my balance and submit the request?" },
      { label: 'Leave policy details', query: "What is the leave policy? How many days of each type am I entitled to per year?" },
      { label: 'Status of my leave request', query: "What is the status of my recent leave application? Has it been approved by my manager?" },
      { label: 'Leave & travel declaration', query: "I'm planning travel during my leave period. What is the leave and travel declaration process?" },
    ],
  },
  {
    id: 'travel',
    label: 'Travel',
    Icon: Car,
    prompts: [
      { label: 'Book a cab for office travel', query: "I need to book a cab for office travel today. Can you help me with the booking?" },
      { label: 'Travel expense reimbursement', query: "How do I submit a travel expense claim? What documents do I need to attach?" },
      { label: 'Outstation travel approval', query: "I need approval for outstation travel. What is the process and who needs to approve it?" },
      { label: 'Hotel booking guidelines', query: "What are the guidelines for hotel bookings during business travel? What is the per-diem limit?" },
      { label: 'Request a travel advance', query: "Can I request a travel advance for an upcoming business trip? What is the process?" },
    ],
  },
  {
    id: 'pms',
    label: 'PMS',
    Icon: BarChart2,
    prompts: [
      { label: 'Set my performance goals', query: "I need to set my performance goals for this cycle. Can you help me with the format and submission?" },
      { label: 'PMS review deadline', query: "When is the PMS review deadline? What steps do I need to complete before it closes?" },
      { label: 'Mid-year review status', query: "Has my mid-year performance review been completed? What feedback was shared by my manager?" },
      { label: 'Help with self-assessment', query: "Can you guide me on how to fill in my self-assessment for the current PMS cycle?" },
      { label: 'Goal achievement progress', query: "How am I tracking against my set PMS goals this quarter? Give me a progress summary." },
    ],
  },
  {
    id: 'benefits',
    label: 'Benefits',
    Icon: BookOpen,
    prompts: [
      { label: 'Health insurance coverage', query: "What does my health insurance policy cover? Can I add family members to my policy?" },
      { label: 'Reimbursement claim status', query: "What is the status of my recent reimbursement claim? When will it be processed?" },
      { label: 'Flexible benefit plan', query: "How does the flexible benefit plan work? What expenses can I claim under it?" },
      { label: 'Provident fund details', query: "Can you show me my current PF contribution details and accumulated balance?" },
      { label: 'Employee stock options', query: "Do I have any ESOPs or stock options? What is their current vesting status?" },
    ],
  },
];

// Right panel content (desktop + mobile share the same body)
function RightPanelBody({ onClose }: { onClose?: () => void }) {
  return (
    <>
      {onClose && (
        <div
          className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Context
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="p-5 space-y-6">
        {/* Employee profile */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
            Employee
          </h3>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-green-600 shrink-0 flex items-center justify-center text-sm font-bold text-white">
              RS
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Rita Sharma</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Unit Manager · AI Unit</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Pune</div>
            </div>
          </div>
        </div>

        <div className="h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Leave balance */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
            Leave Balance
          </h3>
          <div
            className="rounded-xl p-4 space-y-2.5"
            style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
          >
            {LEAVE_BALANCE.map(row => (
              <div key={row.label} className="flex justify-between items-center text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Resources */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
            Resources
          </h3>
          <div className="space-y-1">
            {RESOURCES.map(link => (
              <button
                key={link}
                className="w-full text-left text-xs px-3 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
                style={{ color: '#2563eb', backgroundColor: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)' }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function EmployeeHome() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [botStage, setBotStage] = useState<BotStage>('idle');
  const [prefillText, setPrefillText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text, type: 'user' }]);
    setBotStage('line1');
  };

  useEffect(() => {
    if (botStage === 'idle') return;

    if (botStage === 'line1') {
      const t = setTimeout(() => {
        setMessages(prev => [...prev, { id: `bot-${Date.now()}`, text: 'On it, Rita.', type: 'assistant' }]);
        setBotStage('line2');
      }, 400);
      return () => clearTimeout(t);
    }

    if (botStage === 'line2') {
      const t = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-loading-${Date.now()}`,
          text: 'Checking your HR records...',
          type: 'assistant',
          isLoading: true,
        }]);
        setTimeout(() => {
          setMessages(prev => {
            const without = prev.filter(m => m.text !== 'Checking your HR records...');
            return [...without, {
              id: `bot-${Date.now()}`,
              text: "I've pulled up the relevant details. Your leave balance shows 14 days available.",
              type: 'assistant',
            }];
          });
          setBotStage('line3');
        }, 3500);
      }, 500);
      return () => clearTimeout(t);
    }

    if (botStage === 'line3') {
      const t = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          text: 'Would you like me to initiate the request or share the full policy?',
          type: 'assistant',
        }]);
        setBotStage('done');
      }, 600);
      return () => clearTimeout(t);
    }
  }, [botStage]);

  const hasMessages = messages.length > 0;

  return (
    <AppShell
      conversations={CONVERSATIONS}
      user={USER}
      accentBorderColor="rgba(22,163,74,0.2)"
      accentTextColor="#16a34a"
      rightPanel={
        <div
          className="hidden xl:flex flex-col w-[22rem] border-l overflow-y-auto shrink-0"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
        >
          <RightPanelBody />
        </div>
      }
      rightPanelMobile={(onClose) => <RightPanelBody onClose={onClose} />}
    >
      {hasMessages ? (
        /* ── Chat state: message feed + bottom composer ── */
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-4">
              {/* Greeting stays visible at top once chat starts */}
              <div className="flex flex-col items-center gap-2 text-center pb-2">
                <RoleBadge label="AI Unit" tone="green" />
                <h1
                  className="text-3xl sm:text-4xl leading-tight"
                  style={{ color: 'var(--text-primary)', fontFamily: "'Lora', serif", fontWeight: 400, letterSpacing: '-0.01em' }}
                >
                  Afternoon, Rita
                </h1>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Unit Manager, Pune
                </p>
              </div>

              {messages.map(message => (
                <div key={message.id} style={{ animation: 'slideUpFade 250ms ease-out' }}>
                  {message.type === 'user' && <UserMessageBubble text={message.text} />}
                  {message.type === 'assistant' && (
                    <BotMessageText text={message.text} isLoading={message.isLoading} />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} style={{ height: '4rem' }} />
            </div>
          </div>

          {/* Bottom-pinned composer (chat state) */}
          <div
            className="shrink-0 border-t px-4 py-4"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
          >
            <div className="max-w-2xl mx-auto">
              <ChatComposer onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      ) : (
        /* ── Welcome state: centred composer + suggestive actions below ── */
        <div className="flex flex-col items-center justify-center h-full px-4 py-8 gap-5 overflow-y-auto">
          {/* Greeting */}
          <div className="flex flex-col items-center gap-2 text-center">
            <RoleBadge label="AI Unit" tone="green" />
            <h1
              className="text-3xl sm:text-4xl md:text-5xl leading-tight"
              style={{ color: 'var(--text-primary)', fontFamily: "'Lora', serif", fontWeight: 400, letterSpacing: '-0.01em' }}
            >
              Afternoon, Rita
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Unit Manager, Pune
            </p>
          </div>

          {/* Centred composer */}
          <div className="w-full max-w-xl">
            <ChatComposer
              prefillValue={prefillText}
              onSendMessage={(q) => { setPrefillText(''); handleSendMessage(q); }}
            />
          </div>

          {/* Suggestive action categories */}
          <SuggestiveActions
            categories={EMPLOYEE_CATEGORIES}
            onHoverPrompt={setPrefillText}
            onSelectPrompt={(q) => { setPrefillText(''); handleSendMessage(q); }}
          />
        </div>
      )}

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AppShell>
  );
}
