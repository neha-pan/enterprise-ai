import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  UserCheck, Store, AlertCircle,
  Camera, Upload, CheckCircle2, FileText, RefreshCw,
  Users, Headphones, Database, BookOpen, ChevronRight, X,
  CalendarDays, Shield,
} from 'lucide-react';
import { MessageBubble, ProgressCard } from './sales-helpline/SalesComponents';
import type { Step } from './sales-helpline/SalesComponents';
import { ChatComposer } from './ChatComposer';
import { NextActionsCard, type NextActionItem } from './NextActionsCard';
import { RoleBadge } from './RoleBadge';

// ── Types ──────────────────────────────────────────────────────────────────

export interface B2BContext {
  lan?: string;
  currentName?: string;
  pendingName?: string;
  docSelected?: string;
  status: 'waiting' | 'active' | 'completed';
}

type ChatStage =
  | 'home' | 'ask_lan' | 'lan_processing'
  | 'name_found' | 'doc_capturing' | 'ocr_processing'
  | 'name_confirm' | 'success' | 'generic'
  | 'leave_loading' | 'leave_summary' | 'leave_declaration' | 'leave_decl_success';

// ── Suggestive action categories ───────────────────────────────────────────

const B2B_CATEGORIES = [
  {
    id: 'hr',
    label: 'HR',
    Icon: Users,
    prompts: [
      { label: 'Manage my leaves', query: 'Show my leave balance' },
      { label: 'My claims', query: 'What are all the things I can make a claim for' },
      { label: 'Policy related information', query: 'I have a policy related question, could you help me out' },
      { label: 'Check my incentives', query: 'Show me a breakdown of my earned sales incentives for quater 2' },
      { label: 'Check hierarchy', query: 'Show me the complete reporting structure for my department' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales helpline',
    Icon: Headphones,
    prompts: [
      { label: 'Change customer name', query: "I need to update a customer's name in the system. What documents are required?" },
      { label: 'DO (Delivery Order) governance', query: 'Can you explain the DO governance process and show me the current status of pending delivery orders under my territory?' },
      { label: 'Clarification', query: 'I need clarification on a policy or process. Can you help me understand the correct guidelines?' },
      { label: 'System or Technical issue', query: "I'm facing a system or technical issue. Can you help me log this and connect me with the right support team?" },
      { label: 'Other process related', query: 'I have a process-related query that needs attention. Can you help me find the right information or escalate it to the correct team?' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    Icon: Database,
    prompts: [
      { label: 'Portfolio performance this quarter', query: 'Can you pull up the portfolio performance report for my region for this quarter?' },
      { label: 'Delinquency risk analysis', query: 'Show me the delinquency analysis for my bucket — which accounts are at the highest risk right now?' },
      { label: 'EMI collection trend (last 30 days)', query: 'What is the EMI collection trend over the last 30 days for my assigned accounts?' },
      { label: 'Dealer-wise disbursement data', query: 'Show me dealer-wise disbursement data for this month, sorted by volume.' },
      { label: 'NPA accounts summary', query: 'Give me an NPA summary for my portfolio. Which accounts have crossed the 90-day overdue threshold?' },
    ],
  },
  {
    id: 'learning',
    label: 'Learning & Development',
    Icon: BookOpen,
    prompts: [
      { label: 'My pending training modules', query: "What training modules are currently assigned to me? Show me what's pending and what's overdue." },
      { label: 'Enrol in a product course', query: 'Are there any product knowledge courses available for the new loan products? I\'d like to enrol.' },
      { label: 'Compliance certification status', query: 'When is my compliance certification due? What modules do I need to complete for renewal?' },
      { label: 'Upcoming sales workshops', query: 'Are there any upcoming sales skills workshops or webinars I can register for this quarter?' },
      { label: 'My learning progress report', query: 'Can you show me my overall learning progress this year, including completed trainings and scores?' },
    ],
  },
] as const;

type MsgType =
  | 'text' | 'error' | 'progress' | 'doc_select' | 'capture'
  | 'name_match' | 'success' | 'upload_info'
  | 'leave_table' | 'leave_actions' | 'declaration_card' | 'leave_decl_success';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  type: MsgType;
  content?: string;
  meta?: { steps?: string; doc?: string; matchPct?: number };
}

interface Props {
  onContextUpdate: (ctx: B2BContext) => void;
}

// ── Constants ──────────────────────────────────────────────────────────────

const CURRENT_NAME = 'Rohit P';
const OCR_NAME = 'Rohit Patil';
const MATCH_PCT = 87;

const NAME_CHANGE_TRIGGER = "I need to update a customer's name in the system. What documents are required?";
const LEAVE_BALANCE_TRIGGER = 'Show my leave balance';

const LEAVE_DATA = [
  { label: 'Leaves',                colorVar: 'var(--status-success)', alphaBg: 'rgba(22,163,74,0.07)'  },
  { label: 'WFH Emergency',         colorVar: 'var(--status-warning)', alphaBg: 'rgba(217,119,6,0.07)' },
  { label: 'Official Travel Dates', colorVar: 'var(--status-info)',    alphaBg: 'rgba(37,99,235,0.07)'  },
];

const DECL_MONTH = 'February 2026';
const DECL_REF   = 'LD-2026-00214';

// ── Main component ─────────────────────────────────────────────────────────

export function B2BChat({ onContextUpdate }: Props) {
  const [stage, setStage] = useState<ChatStage>('home');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [procSteps, setProcSteps]   = useState<Step[]>([]);
  const [ocrSteps, setOcrSteps]     = useState<Step[]>([]);
  const [leaveSteps, setLeaveSteps] = useState<Step[]>([]);
  const [ctx, setCtx] = useState<B2BContext>({ status: 'waiting' });
  const endRef     = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Home screen state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [prefillText, setPrefillText] = useState('');

  const b2bActions: NextActionItem[] = [
    { id: 'update_customer_name', label: 'Update customer name', icon: <UserCheck size={18} /> },
    { id: 'policy_document', label: 'Explain policy document', icon: <FileText size={18} /> },
    { id: 'it_request', label: 'Raise an IT request', icon: <AlertCircle size={18} /> },
    { id: 'dealer_cancellation', label: 'Raise a dealer cancellation request', icon: <Store size={18} /> },
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const updateCtx = (patch: Partial<B2BContext>) => {
    setCtx(prev => {
      const next = { ...prev, ...patch };
      onContextUpdate(next);
      return next;
    });
  };

  const push = (role: Msg['role'], type: MsgType, content = '', meta: Msg['meta'] = {}) => {
    setMsgs(p => [...p, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role, type, content, meta,
    }]);
  };

  // ── Name-change journey ────────────────────────────────────────────────

  const startJourney = () => {
    push('user', 'text', 'Update customer name');
    updateCtx({ status: 'active' });
    setTimeout(() => {
      push('assistant', 'text', "Please enter the customer's 15-digit Loan Account Number (LAN) to continue.");
      setStage('ask_lan');
    }, 300);
  };

  const handleLanSend = (val: string) => {
    if (!val || stage !== 'ask_lan') return;
    push('user', 'text', val);

    if (/[^0-9]/.test(val)) {
      setTimeout(() => push('assistant', 'error', 'Enter digits only. Please provide the 15-digit LAN again.'), 250);
      return;
    }
    if (val.length !== 15) {
      setTimeout(() => push('assistant', 'error', `LAN must be exactly 15 digits — you entered ${val.length}. Please try again.`), 250);
      return;
    }

    updateCtx({ lan: val });
    setStage('lan_processing');

    const init: Step[] = [
      { id: '1', label: 'Validating LAN', status: 'running' },
      { id: '2', label: 'Checking customer records', status: 'pending' },
      { id: '3', label: 'Preparing update flow', status: 'pending' },
    ];
    setProcSteps(init);
    push('assistant', 'progress', '', { steps: 'proc' });

    setTimeout(() => setProcSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : i === 1 ? 'running' : 'pending') as Step['status'],
    }))), 800);
    setTimeout(() => setProcSteps(p => p.map((s, i) => ({
      ...s, status: (i <= 1 ? 'completed' : 'running') as Step['status'],
    }))), 1600);
    setTimeout(() => {
      setProcSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
      updateCtx({ currentName: CURRENT_NAME });
    }, 2400);
    setTimeout(() => {
      push('assistant', 'text', `${CURRENT_NAME} is the customer's current name in the system.`);
      push('assistant', 'upload_info');
      push('assistant', 'capture', '', { doc: 'PAN card or Aadhaar card' });
      setStage('doc_capturing');
    }, 2900);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 5 * 1024 * 1024) {
      push('assistant', 'error', 'File exceeds the 5 MB limit. Please upload a smaller file.');
      return;
    }
    handleCapture();
  };

  const handleCapture = () => {
    if (stage !== 'doc_capturing') return;
    push('user', 'text', 'Document uploaded');
    setStage('ocr_processing');

    const init: Step[] = [
      { id: '1', label: 'Reading document', status: 'running' },
      { id: '2', label: 'Extracting customer name', status: 'pending' },
      { id: '3', label: 'Verifying supported fields', status: 'pending' },
    ];
    setOcrSteps(init);
    push('assistant', 'progress', '', { steps: 'ocr' });

    setTimeout(() => setOcrSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : i === 1 ? 'running' : 'pending') as Step['status'],
    }))), 900);
    setTimeout(() => setOcrSteps(p => p.map((s, i) => ({
      ...s, status: (i <= 1 ? 'completed' : 'running') as Step['status'],
    }))), 1800);
    setTimeout(() => {
      setOcrSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
      updateCtx({ pendingName: OCR_NAME });
    }, 2600);
    setTimeout(() => {
      push('assistant', 'name_match', '', { matchPct: MATCH_PCT });
      setStage('name_confirm');
    }, 3000);
  };

  const handleConfirm = (yes: boolean) => {
    if (stage !== 'name_confirm') return;
    if (yes) {
      setTimeout(() => {
        push('assistant', 'success');
        setStage('success');
        updateCtx({ status: 'completed' });
      }, 350);
    } else {
      setTimeout(() => {
        push('assistant', 'text', 'Please upload another document for verification.');
        push('assistant', 'capture', '', { doc: 'PAN card or Aadhaar card' });
        setStage('doc_capturing');
        updateCtx({ pendingName: undefined });
      }, 350);
    }
  };

  // ── Leave balance journey ──────────────────────────────────────────────

  const startLeaveJourney = () => {
    updateCtx({ status: 'active' });
    setStage('leave_loading');

    const init: Step[] = [
      { id: '1', label: 'Connecting to Chroma HRMS', status: 'running' },
      { id: '2', label: 'Fetching leave records', status: 'pending' },
      { id: '3', label: 'Preparing summary', status: 'pending' },
    ];
    setLeaveSteps(init);
    push('assistant', 'progress', '', { steps: 'leave' });

    setTimeout(() => setLeaveSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : i === 1 ? 'running' : 'pending') as Step['status'],
    }))), 800);
    setTimeout(() => setLeaveSteps(p => p.map((s, i) => ({
      ...s, status: (i <= 1 ? 'completed' : 'running') as Step['status'],
    }))), 1600);
    setTimeout(() => {
      setLeaveSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 2400);
    setTimeout(() => {
      push('assistant', 'leave_table');
      push('assistant', 'text', 'What would you like to do next?');
      push('assistant', 'leave_actions');
      setStage('leave_summary');
    }, 2900);
  };

  const handleLeaveAction = (action: string) => {
    if (stage !== 'leave_summary') return;
    if (action === 'declaration') {
      push('user', 'text', 'Leave & travel declaration');
      setTimeout(() => {
        push('assistant', 'declaration_card');
        setStage('leave_declaration');
      }, 300);
    } else {
      push('user', 'text', action === 'apply_leave' ? 'Apply for leaves' : 'Apply official travel dates');
      setTimeout(() => {
        push('assistant', 'text', "I'll help you with that. This feature is coming soon.");
        setStage('generic');
      }, 400);
    }
  };

  const handleDeclaration = (accepted: boolean) => {
    if (stage !== 'leave_declaration') return;
    push('user', 'text', accepted ? 'I accept' : 'Reject');
    if (accepted) {
      setTimeout(() => {
        push('assistant', 'leave_decl_success');
        setStage('leave_decl_success');
        updateCtx({ status: 'completed' });
      }, 350);
    } else {
      setTimeout(() => {
        push('assistant', 'text', 'Declaration rejected. No action has been recorded for this month.');
        setStage('generic');
      }, 350);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────

  const handleStartAnotherRequest = () => {
    const resetCtx: B2BContext = { status: 'waiting' };
    setMsgs([]);
    setProcSteps([]);
    setOcrSteps([]);
    setLeaveSteps([]);
    setCtx(resetCtx);
    onContextUpdate(resetCtx);
    setStage('home');
  };

  // ── Home prompt dispatcher ─────────────────────────────────────────────

  const handleB2BActionClick = (actionId: string) => {
    if (actionId === 'update_customer_name') { startJourney(); return; }
    const selected = b2bActions.find(item => item.id === actionId);
    if (selected) push('user', 'text', selected.label);
  };

  const handleHomePromptSend = (query: string) => {
    setActiveCategory(null);
    setPrefillText('');
    push('user', 'text', query);
    updateCtx({ status: 'active' });

    if (query === NAME_CHANGE_TRIGGER) {
      setTimeout(() => {
        push('assistant', 'text', "Please enter the customer's 15-digit Loan Account Number (LAN) to continue.");
        setStage('ask_lan');
      }, 300);
      return;
    }
    if (query === LEAVE_BALANCE_TRIGGER) {
      setTimeout(() => startLeaveJourney(), 300);
      return;
    }
    setTimeout(() => {
      push('assistant', 'text', "I'll look into that for you. Give me a moment.");
      setStage('generic');
    }, 400);
  };

  // ── Derived render helpers ─────────────────────────────────────────────

  const lastCaptureId    = msgs.filter(m => m.type === 'capture').at(-1)?.id;
  const lastNameMatchId  = msgs.filter(m => m.type === 'name_match').at(-1)?.id;
  const lastLeaveActionsId = msgs.filter(m => m.type === 'leave_actions').at(-1)?.id;
  const lastDeclCardId   = msgs.filter(m => m.type === 'declaration_card').at(-1)?.id;

  // ── Home screen ────────────────────────────────────────────────────────

  if (stage === 'home') {
    const activeCat = B2B_CATEGORIES.find(c => c.id === activeCategory) ?? null;

    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-8 gap-5 overflow-y-auto">
        <div className="flex flex-col items-center gap-2 text-center">
          <RoleBadge label="B2B Urban" tone="purple" />
          <h1
            className="text-3xl sm:text-4xl md:text-5xl leading-tight"
            style={{ color: 'var(--text-primary)', fontFamily: "'Lora', serif", fontWeight: 400, letterSpacing: '-0.01em' }}
          >
            Afternoon, Rahul
          </h1>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Sales Manager, Nagpur
          </p>
        </div>

        <div className="w-full max-w-xl">
          <ChatComposer
            placeholder="Chat with your Bajaj AI assistant... (e.g., 'What is my leave balance?')"
            prefillValue={prefillText}
            onSendMessage={handleHomePromptSend}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {B2B_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm transition-colors"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: activeCategory === cat.id ? 'var(--surface-2)' : 'transparent',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = activeCategory === cat.id ? 'var(--surface-2)' : 'transparent'; }}
            >
              <cat.Icon size={14} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
              {cat.label}
            </button>
          ))}
        </div>

        {activeCat && (
          <motion.div
            key={activeCat.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <activeCat.Icon size={14} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {activeCat.label}
                </span>
              </div>
              <button
                onClick={() => { setActiveCategory(null); setPrefillText(''); }}
                className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={13} />
              </button>
            </div>

            {activeCat.prompts.map((prompt, i) => (
              <button
                key={i}
                className="flex items-center justify-between w-full px-4 py-3.5 text-left text-sm transition-colors"
                style={{
                  borderBottom: i < activeCat.prompts.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
                  setPrefillText(prompt.query);
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  setPrefillText('');
                }}
                onClick={() => {
                  setActiveCategory(null);
                  setPrefillText(prompt.query);
                }}
              >
                <span>{prompt.label}</span>
                <ChevronRight size={14} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              </button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  // ── Chat screen ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col">

          {msgs.map(m => {

            // ── text / error ──────────────────────────────────────────
            if (m.type === 'text' || m.type === 'error') {
              return (
                <MessageBubble
                  key={m.id}
                  role={m.role}
                  content={
                    m.type === 'error'
                      ? (
                        <span className="flex items-start gap-2">
                          <AlertCircle size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--status-danger)' }} />
                          {m.content}
                        </span>
                      )
                      : m.content ?? ''
                  }
                />
              );
            }

            // ── progress card ─────────────────────────────────────────
            if (m.type === 'progress') {
              const isLeave = m.meta?.steps === 'leave';
              const isOcr   = m.meta?.steps === 'ocr';
              const steps = isLeave ? leaveSteps : isOcr ? ocrSteps : procSteps;
              const title = isLeave ? 'Fetching leave data' : isOcr ? 'Reading document' : 'Checking records';
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title={title} steps={steps} />
                </div>
              );
            }

            // ── upload instructions ───────────────────────────────────
            if (m.type === 'upload_info') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex w-full justify-start mb-4">
                  <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-bl-none px-5 py-3 shadow-sm text-sm"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                    <p className="mb-2">To verify the updated name, please upload one of the following documents:</p>
                    <ul className="space-y-1 pl-1">
                      {['PAN card', 'Aadhaar card'].map(doc => (
                        <li key={doc} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--text-secondary)' }} />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            }

            // ── capture / upload card ─────────────────────────────────
            if (m.type === 'capture') {
              const isLive = stage === 'doc_capturing' && m.id === lastCaptureId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText size={16} style={{ color: 'var(--brand-blue)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {m.meta?.doc ?? 'Verification Document'}
                      </span>
                    </div>

                    <button
                      onClick={isLive ? () => fileInputRef.current?.click() : undefined}
                      disabled={!isLive}
                      className="sm:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        backgroundColor: isLive ? 'var(--brand-blue)' : 'var(--surface-2)',
                        color: isLive ? '#fff' : 'var(--text-secondary)',
                        opacity: isLive ? 1 : 0.6,
                      }}>
                      <Camera size={16} />
                      {isLive ? 'Capture Document' : 'Captured'}
                    </button>

                    <button
                      onClick={isLive ? () => fileInputRef.current?.click() : undefined}
                      disabled={!isLive}
                      className="hidden sm:flex w-full items-center justify-center gap-2 py-6 rounded-xl text-sm font-medium transition-all border-2 border-dashed"
                      style={{
                        borderColor: isLive ? 'var(--brand-blue)' : 'var(--border-subtle)',
                        color: isLive ? 'var(--brand-blue)' : 'var(--text-secondary)',
                        backgroundColor: isLive ? 'rgba(37,99,235,0.04)' : 'var(--surface-2)',
                        opacity: isLive ? 1 : 0.6,
                      }}>
                      <Upload size={16} />
                      {isLive ? 'Click to upload document' : 'Document uploaded'}
                    </button>

                    {isLive && (
                      <div className="flex items-center justify-between mt-3 px-1">
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Ensure the document is clearly visible and all text is legible
                        </p>
                        <span className="text-xs font-medium ml-3 shrink-0 px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                          Max 5 MB
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            }

            // ── name match card ───────────────────────────────────────
            if (m.type === 'name_match') {
              const isLive = stage === 'name_confirm' && m.id === lastNameMatchId;
              const pct = m.meta?.matchPct ?? 0;
              const matchColor = pct >= 80 ? 'var(--status-success)' : pct >= 40 ? 'var(--status-warning)' : 'var(--status-danger)';
              const matchLabel = pct >= 80 ? 'Strong match' : pct >= 40 ? 'Partial match' : 'Low match';
              const matchBg    = pct >= 80 ? 'rgba(22,163,74,0.1)' : pct >= 40 ? 'rgba(217,119,6,0.1)' : 'rgba(220,38,38,0.1)';

              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    <div className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Name verification result
                    </div>

                    <div className="rounded-xl p-4 mb-4 space-y-3" style={{ backgroundColor: 'var(--surface-2)' }}>
                      {[
                        { label: 'Current name in system', value: CURRENT_NAME },
                        { label: 'Name from document',     value: OCR_NAME },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium" style={{ color: matchColor }}>{matchLabel}</span>
                        <span className="text-xs font-semibold" style={{ color: matchColor }}>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: matchColor }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        />
                      </div>
                      <div className="mt-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: matchBg, color: matchColor }}>
                        The name on the document closely matches the system record. You may proceed with the update.
                      </div>
                    </div>

                    {isLive && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2">
                        <button
                          onClick={() => handleConfirm(true)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
                          style={{ backgroundColor: 'var(--brand-blue)' }}>
                          <CheckCircle2 size={15} />
                          Confirm & Update
                        </button>
                        <button
                          onClick={() => handleConfirm(false)}
                          className="w-full text-center py-2 text-sm transition-all hover:opacity-70"
                          style={{ color: 'var(--text-secondary)' }}>
                          Decline
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            }

            // ── name-change success card ──────────────────────────────
            if (m.type === 'success') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid rgba(22,163,74,0.3)' }}>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(22,163,74,0.12)' }}>
                        <CheckCircle2 size={20} style={{ color: 'var(--status-success)' }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--status-success)' }}>
                          Customer name updated successfully
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Updated name: <span style={{ color: 'var(--text-primary)' }}>{OCR_NAME}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-4 mb-4 space-y-2" style={{ backgroundColor: 'var(--surface-2)' }}>
                      {[
                        { label: 'Log ID',        value: 'NC-2026-08431', mono: true },
                        { label: 'Verified via',  value: 'Uploaded document', mono: false },
                        { label: 'Audit note',    value: 'Updated by store employee', mono: false },
                        { label: 'Timestamp',     value: 'Today, 3:42 PM', mono: false },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span className={row.mono ? 'font-mono' : ''} style={{ color: 'var(--text-primary)' }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleStartAnotherRequest}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                      <RefreshCw size={14} style={{ color: 'var(--text-secondary)' }} />
                      Start new chat
                    </button>
                  </div>
                </motion.div>
              );
            }

            // ── leave table ───────────────────────────────────────────
            if (m.type === 'leave_table') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full mb-3">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    {/* Table header */}
                    <div className="grid grid-cols-3 px-4 py-2.5"
                      style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Category</span>
                      <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>Jan – Feb 2026</span>
                      <span className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>Feb 2026</span>
                    </div>

                    {/* Table rows — staggered reveal */}
                    {LEAVE_DATA.map((row, i) => (
                      <motion.div
                        key={row.label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut', delay: 0.08 + i * 0.07 }}
                        className="grid grid-cols-3 items-center px-4 py-3"
                        style={{
                          borderBottom: i < LEAVE_DATA.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          backgroundColor: row.alphaBg,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.colorVar }} />
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{row.label}</span>
                        </div>
                        <span className="text-xs font-medium text-center" style={{ color: 'var(--text-primary)' }}>0</span>
                        <span className="text-xs font-medium text-right" style={{ color: 'var(--text-primary)' }}>0</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            }

            // ── leave action buttons ───────────────────────────────────
            if (m.type === 'leave_actions') {
              const isLive = stage === 'leave_summary' && m.id === lastLeaveActionsId;
              const actions = [
                { id: 'apply_leave',  label: 'Apply for leaves',          Icon: CalendarDays },
                { id: 'declaration',  label: 'Leave & travel declaration', Icon: Shield },
                { id: 'travel_dates', label: 'Apply official travel dates', Icon: FileText },
              ];
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut', delay: 0.08 }}
                  className="flex flex-wrap gap-2 mb-4">
                  {actions.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => isLive && handleLeaveAction(id)}
                      disabled={!isLive}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        opacity: isLive ? 1 : 0.5,
                        cursor: isLive ? 'pointer' : 'default',
                      }}>
                      <Icon size={13} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
                      {label}
                    </button>
                  ))}
                </motion.div>
              );
            }

            // ── declaration card ──────────────────────────────────────
            if (m.type === 'declaration_card') {
              const isLive = stage === 'leave_declaration' && m.id === lastDeclCardId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    {/* Title */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(37,99,235,0.1)' }}>
                        <Shield size={15} style={{ color: 'var(--brand-blue)' }} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Leave & Travel Declaration
                      </span>
                    </div>

                    {/* Declaration body */}
                    <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
                      I hereby declare that I have submitted all my leaves and marked my official travel
                      dates for <span className="font-medium">{DECL_MONTH}</span> on CHROMA™. I confirm
                      I have not missed marking any leaves taken for the calendar year from January 2026.
                      I understand I will be solely responsible for any missed days, and liable for action
                      as per Bajaj Finance Limited's Code of Conduct.
                    </p>

                    {/* Divider */}
                    <div className="mb-4" style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

                    {/* Consent */}
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.12 }}
                      className="flex items-start gap-2 mb-5">
                      <div className="w-3.5 h-3.5 rounded-sm border mt-0.5 shrink-0 flex items-center justify-center"
                        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                        <CheckCircle2 size={9} style={{ color: 'var(--text-secondary)' }} />
                      </div>
                      <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        I confirm the above declaration is true and complete.
                      </span>
                    </motion.div>

                    {/* Actions */}
                    {isLive && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: 0.1 }}
                        className="flex gap-3">
                        <button
                          onClick={() => handleDeclaration(true)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
                          style={{ backgroundColor: 'var(--brand-blue)' }}>
                          <CheckCircle2 size={14} />
                          I accept
                        </button>
                        <button
                          onClick={() => handleDeclaration(false)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                          Reject
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            }

            // ── leave declaration success ──────────────────────────────
            if (m.type === 'leave_decl_success') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid rgba(22,163,74,0.3)' }}>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(22,163,74,0.12)' }}>
                        <CheckCircle2 size={20} style={{ color: 'var(--status-success)' }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--status-success)' }}>
                          Declaration submitted
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Leave & travel declaration for {DECL_MONTH}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-4 mb-4 space-y-2" style={{ backgroundColor: 'var(--surface-2)' }}>
                      {[
                        { label: 'Reference ID', value: DECL_REF,        mono: true },
                        { label: 'Month',        value: DECL_MONTH,      mono: false },
                        { label: 'Submitted on', value: 'Today, 3:42 PM', mono: false },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span className={row.mono ? 'font-mono' : ''} style={{ color: 'var(--text-primary)' }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleStartAnotherRequest}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                      <RefreshCw size={14} style={{ color: 'var(--text-secondary)' }} />
                      Start new chat
                    </button>
                  </div>
                </motion.div>
              );
            }

            return null;
          })}

          <div ref={endRef} className="h-4" />
        </div>
      </div>

      {/* Bottom tray */}
      <div className="shrink-0 border-t px-4 py-4"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-2xl mx-auto">
          <ChatComposer
            placeholder={
              stage === 'ask_lan'             ? 'Enter 15-digit LAN' :
              stage === 'doc_capturing'       ? 'Upload the document above' :
              stage === 'name_confirm'        ? 'Reply using the options above' :
              stage === 'leave_summary'       ? 'Choose an option above' :
              stage === 'leave_declaration'   ? 'Reply using the options above' :
              (stage === 'success' || stage === 'leave_decl_success' || stage === 'generic')
                                              ? 'What would you like to do next?' :
              'Processing…'
            }
            disabled={
              stage !== 'ask_lan' &&
              stage !== 'generic' &&
              stage !== 'leave_decl_success'
            }
            onSendMessage={stage === 'ask_lan' ? handleLanSend : undefined}
            onNewConversation={handleStartAnotherRequest}
          />
        </div>
      </div>
    </div>
  );
}
