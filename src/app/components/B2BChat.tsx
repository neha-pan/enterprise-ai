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

const NAME_CHANGE_PROMPT = "I need to correct my customer's name on their loan account";
const normalizeIntent = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const isNameChangeIntent = (query: string) => {
  const normalized = normalizeIntent(query);
  return (
    normalized === normalizeIntent(NAME_CHANGE_PROMPT) ||
    normalized.includes('name change') ||
    (normalized.includes('change') && normalized.includes('customer') && normalized.includes('name')) ||
    (normalized.includes('update') && normalized.includes('customer') && normalized.includes('name')) ||
    (normalized.includes('correct') && normalized.includes('customer') && normalized.includes('name'))
  );
};

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
  | 'leave_loading' | 'leave_summary' | 'leave_declaration' | 'leave_decl_success'
  | 'leave_date_ask'
  | 'leave_apply_loading' | 'leave_apply_confirm' | 'leave_apply_submitting' | 'leave_apply_success'
  | 'peers_loading' | 'peers_summary' | 'peers_incentive_loading' | 'peers_incentive'
  | 'rank_loading' | 'rank_summary'
  | 'portfolio_loading' | 'portfolio_summary'
  | 'do_intent' | 'do_upload' | 'do_mail_processing' | 'do_governance' | 'do_cancelled'
  | 'claim_bill_upload' | 'claim_bill_fetching'
  | 'claim_proof_upload' | 'claim_proof_fetching'
  | 'claim_bill_type' | 'claim_review' | 'claim_submitting' | 'claim_submitted';

const CLAIM_TRIGGER = 'I want to raise a meal claim';

const isLeaveApplyIntent = (query: string) => {
  const n = query.toLowerCase();
  return (
    n.includes('apply') && (n.includes('leave') || n.includes('holiday') || n.includes('day off')) ||
    n.includes('take a leave') || n.includes('take leave') ||
    n.includes('apply for leave') || n.includes('apply for a leave') ||
    n.includes('apply casual') || n.includes('half day') ||
    (n.includes('marriage') && (n.includes('leave') || n.includes('apply') || n.includes('half'))) ||
    (n.includes('attend') && n.includes('leave'))
  );
};

const isRankVsPeersIntent = (query: string) => {
  const n = query.toLowerCase();
  return (
    n.includes('rank vs peers') || n.includes('my rank vs') ||
    n.includes('show me my rank')
  );
};

const isPeersIntent = (query: string) => {
  const n = query.toLowerCase();
  return (
    n.includes('me vs my peers') || n.includes('vs my peers') || n.includes('vs peers') ||
    (n.includes('how am i') && n.includes('performing')) ||
    (n.includes('comparison') && n.includes('peers')) ||
    (n.includes('compared') && n.includes('peers')) ||
    (n.includes('my peers') && n.includes('perform')) ||
    n.includes('my rank') || n.includes('peer comparison')
  );
};

const isPortfolioIntent = (query: string) => {
  const n = query.toLowerCase();
  return (
    n.includes('cd loan portfolio') ||
    n.includes('portfolio performance') ||
    (n.includes('performance') && n.includes('vs target')) ||
    (n.includes('target') && n.includes('achievement'))
  );
};

const isClaimIntent = (query: string) => {
  const n = query.toLowerCase();
  return (
    n.includes('meal claim') || n.includes('food claim') || n.includes('meal expense') ||
    n.includes('raise a claim') || n.includes('submit a claim') || n.includes('raise claim') ||
    n.includes('expense claim') || n.includes('food bill') ||
    n.includes('reimburse') || n.includes('reimbursement') ||
    n.includes('my claims') || n.includes('claim')
  );
};

const isIncentiveIntent = (query: string) => {
  const n = query.toLowerCase();
  return (
    n.includes('incentive') || n.includes('how much will i get') ||
    n.includes('how much') || n.includes('payout') || n.includes('bonus') ||
    n.includes('earnings') || n.includes('how much will') || n.includes('kitna')
  );
};

// ── Suggestive action categories ───────────────────────────────────────────

const B2B_CATEGORIES = [
  {
    id: 'data',
    label: 'My Reports',
    Icon: Database,
    prompts: [
      { label: 'My target vs my achievement', query: 'Show me my CD Loan portfolio performance vs target for this month' },
      { label: 'My Rank vs Peers', query: 'Show me my rank vs peers' },
      { label: 'My Approved But Not Disbursed', query: 'Show me all approved cases that are yet to be disbursed in my portfolio' },
      { label: 'dealer wise disbursement data', query: 'Show me dealer-wise disbursement data for this month, sorted by volume' },
      { label: 'My DVR appointments', query: 'Show me all my DVR appointments scheduled for this week' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales helpline',
    Icon: Headphones,
    prompts: [
      { label: 'Correct customer name', query: NAME_CHANGE_PROMPT },
      { label: 'DO (Delivery Order) governance', query: 'Can you explain the DO governance process?' },
      { label: 'Clarification', query: 'I need clarification on a policy or process. Can you help me understand the correct guidelines?' },
      { label: 'System or Technical issue', query: "I'm facing a system or technical issue. Can you help me log this and connect me with the right support team?" },
      { label: 'Other process related', query: 'I have a process-related query that needs attention. Can you help me find the right information or escalate it to the correct team?' },
    ],
  },
  {
    id: 'hr',
    label: 'HR',
    Icon: Users,
    prompts: [
      { label: 'Manage my leaves', query: 'Show my leave balance' },
      { label: 'My claims', query: CLAIM_TRIGGER },
      { label: 'Policy related information', query: 'I have a policy related question, could you help me out' },
      { label: 'Check my incentives', query: 'Show me a breakdown of my earned sales incentives for quater 2' },
      { label: 'Check hierarchy', query: 'Show me the complete reporting structure for my department' },
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
  | 'leave_table' | 'leave_actions' | 'declaration_card' | 'leave_decl_success'
  | 'leave_apply_card' | 'leave_apply_success_card'
  | 'target_achievement_card'
  | 'peers_breakdown_card' | 'peers_incentive_card' | 'leaderboard_card'
  | 'do_quick_reply' | 'do_upload_card' | 'do_mail_steps' | 'do_governance_card' | 'do_cancelled_card'
  | 'claim_upload_card' | 'claim_fetch_loader' | 'claim_proof_card' | 'claim_proof_loader'
  | 'claim_bill_type_chips' | 'claim_review_card' | 'claim_submit_loader' | 'claim_success_card';

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
const VALID_NAME_CHANGE_LAN = '1033456780';

const NAME_CHANGE_TRIGGER = NAME_CHANGE_PROMPT;
const LEAVE_BALANCE_TRIGGER = 'Show my leave balance';
const DO_GOVERNANCE_TRIGGER = 'Can you explain the DO governance process?';

const CLAIM_BILL = {
  vendor:   "JOEY'S PIZZA",
  billNo:   'JPZ-2026-4892',
  date:     '28 Feb 2026',
  amount:   '₹847.00',
  gst:      '₹152.46',
  total:    '₹999.46',
  category: 'Meal / Food',
  ref:      'CLM-2026-00847',
};

const DO_LAN    = 'XX123456';
const DO_DEALER = 'Ajay Verma';
const DO_TRIP   = 'Pune → Nashik';

const LEAVE_DATA = [
  { label: 'Leaves',                colorVar: 'var(--status-success)', alphaBg: 'rgba(22,163,74,0.07)',  ytd: 5, mtd: 2 },
  { label: 'WFH Emergency',         colorVar: 'var(--status-warning)', alphaBg: 'rgba(217,119,6,0.07)', ytd: 3, mtd: 1 },
  { label: 'Official Travel Dates', colorVar: 'var(--status-info)',    alphaBg: 'rgba(37,99,235,0.07)',  ytd: 8, mtd: 3 },
];

const DECL_MONTH = 'February 2026';
const DECL_REF   = 'LD-2026-00214';

// ── Leave date parser ──────────────────────────────────────────────────────

interface LeaveDate { dateStr: string; duration: string; }

function parseLeaveDateInput(text: string): LeaveDate {
  const t = text.trim().toLowerCase();
  const today = new Date();

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Range: "5 apr to 7 apr", "5-7 apr", "5 apr – 7 apr"
  const rangeMatch = t.match(
    /(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(?:to|–|-)\s*(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?[a-z]*/
  );
  if (rangeMatch) {
    const months: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    const m1 = months[rangeMatch[2]];
    const m2 = rangeMatch[4] ? months[rangeMatch[4]] : m1;
    const d1 = new Date(today.getFullYear(), m1, parseInt(rangeMatch[1]));
    const d2 = new Date(today.getFullYear(), m2, parseInt(rangeMatch[3]));
    const days = Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
    return { dateStr: `${fmt(d1)} – ${fmt(d2)}`, duration: `${days} day(s)` };
  }

  // today / tmrw / tomorrow
  if (t.includes('today')) {
    return { dateStr: fmt(today), duration: '1 day(s)' };
  }
  if (t.includes('tomorrow') || t.includes('tmrw')) {
    const d = new Date(today); d.setDate(d.getDate() + 1);
    return { dateStr: fmt(d), duration: '1 day(s)' };
  }
  if (t.includes('half day') || t.includes('half-day')) {
    return { dateStr: `${fmt(today)} (Second Half)`, duration: '0.5 day(s)' };
  }

  // Single date: "5 apr", "april 5"
  const singleMatch = t.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  const singleMatchRev = t.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})/);
  if (singleMatch) {
    const months: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    const d = new Date(today.getFullYear(), months[singleMatch[2]], parseInt(singleMatch[1]));
    return { dateStr: fmt(d), duration: '1 day(s)' };
  }
  if (singleMatchRev) {
    const months: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    const d = new Date(today.getFullYear(), months[singleMatchRev[1]], parseInt(singleMatchRev[2]));
    return { dateStr: fmt(d), duration: '1 day(s)' };
  }

  // Fallback: use tomorrow
  const d = new Date(today); d.setDate(d.getDate() + 1);
  return { dateStr: fmt(d), duration: '1 day(s)' };
}

// ── Main component ─────────────────────────────────────────────────────────

export function B2BChat({ onContextUpdate }: Props) {
  const [stage, setStage] = useState<ChatStage>('home');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [procSteps, setProcSteps]   = useState<Step[]>([]);
  const [ocrSteps, setOcrSteps]     = useState<Step[]>([]);
  const [leaveSteps, setLeaveSteps] = useState<Step[]>([]);
  const [doSteps, setDoSteps]           = useState<Step[]>([]);
  const [claimFetchSteps, setClaimFetchSteps]   = useState<Step[]>([]);
  const [claimProofSteps, setClaimProofSteps]   = useState<Step[]>([]);
  const [claimSubmitSteps, setClaimSubmitSteps] = useState<Step[]>([]);
  const [leaveApplySteps, setLeaveApplySteps]   = useState<Step[]>([]);
  const [leaveSubmitSteps, setLeaveSubmitSteps] = useState<Step[]>([]);
  const [peersSteps, setPeersSteps]             = useState<Step[]>([]);
  const [peersIncentiveSteps, setPeersIncentiveSteps] = useState<Step[]>([]);
  const [rankSteps, setRankSteps]               = useState<Step[]>([]);
  const [portfolioSteps, setPortfolioSteps]     = useState<Step[]>([]);
  const [ctx, setCtx] = useState<B2BContext>({ status: 'waiting' });
  const [leaveDate, setLeaveDate] = useState<LeaveDate | null>(null);
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

  const promptForLoanAccount = () => {
    updateCtx({ status: 'active' });
    setTimeout(() => {
      push('assistant', 'text', 'Please enter the 10-digit Loan Account Number:');
      setStage('ask_lan');
    }, 300);
  };

  // ── Name-change journey ────────────────────────────────────────────────

  const startJourney = (intent = NAME_CHANGE_PROMPT) => {
    push('user', 'text', intent);
    promptForLoanAccount();
  };

  const handleLanSend = (val: string) => {
    if (!val || stage !== 'ask_lan') return;
    push('user', 'text', val);

    if (/[^0-9]/.test(val)) {
      setTimeout(() => push('assistant', 'error', 'Enter digits only. Please provide the 10-digit Loan Account Number again.'), 250);
      return;
    }
    if (val.length !== 10) {
      setTimeout(() => push('assistant', 'error', `Loan Account Number must be exactly 10 digits. You entered ${val.length}. Please try again.`), 250);
      return;
    }
    updateCtx({ lan: val });
    setStage('lan_processing');

    const init: Step[] = [
      { id: '1', label: 'Validating Loan Account Number', status: 'running' },
      { id: '2', label: 'Checking customer records', status: 'pending' },
      { id: '3', label: 'Preparing name change workflow', status: 'pending' },
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
      push('assistant', 'capture', '', { doc: 'Supporting document format: PDF, JPEG, PNG' });
      setStage('doc_capturing');
    }, 2900);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const isClaimStage = stage === 'claim_bill_upload' || stage === 'claim_proof_upload';
    if (file.size > 5 * 1024 * 1024) {
      push('assistant', 'error', 'File exceeds the 5 MB limit. Please upload a smaller file.');
      return;
    }
    if (stage === 'do_upload') {
      handleDOUpload();
    } else if (stage === 'claim_bill_upload') {
      handleBillUpload();
    } else if (stage === 'claim_proof_upload') {
      handleProofUpload();
    } else {
      handleCapture();
    }
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
        push('assistant', 'capture', '', { doc: 'Supporting document format: PDF, JPEG, PNG' });
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
      { id: '1', label: 'Fetching leave records', status: 'running' },
      { id: '2', label: 'Preparing leave summary', status: 'pending' },
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

  // ── Leave application journey ──────────────────────────────────────────

  const startLeaveApplyJourney = (userText: string) => {
    push('user', 'text', userText);
    updateCtx({ status: 'active' });
    setStage('leave_apply_loading');

    const init: Step[] = [
      { id: '1', label: 'Analysing your request',      status: 'running' },
      { id: '2', label: 'Checking leave balance',       status: 'pending' },
      { id: '3', label: 'Preparing leave application',  status: 'pending' },
    ];
    setLeaveApplySteps(init);
    push('assistant', 'progress', '', { steps: 'leave_apply' });

    setTimeout(() => setLeaveApplySteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : i === 1 ? 'running' : 'pending') as Step['status'],
    }))), 800);
    setTimeout(() => setLeaveApplySteps(p => p.map((s, i) => ({
      ...s, status: (i <= 1 ? 'completed' : 'running') as Step['status'],
    }))), 1600);
    setTimeout(() => {
      setLeaveApplySteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 2400);
    setTimeout(() => {
      push('assistant', 'text', "Got it! Here's the leave application I've prepared based on your request:");
      push('assistant', 'leave_apply_card');
      setStage('leave_apply_confirm');
    }, 2900);
  };

  const handleLeaveApplyAction = (confirmed: boolean) => {
    if (stage !== 'leave_apply_confirm') return;
    push('user', 'text', confirmed ? 'Confirm' : 'Cancel');
    if (!confirmed) {
      setTimeout(() => {
        push('assistant', 'text', 'No problem — your leave request has been discarded.');
        setStage('generic');
      }, 350);
      return;
    }

    setStage('leave_apply_submitting');
    const submitInit: Step[] = [
      { id: '1', label: 'Submitting leave application', status: 'running' },
    ];
    setLeaveSubmitSteps(submitInit);
    push('assistant', 'progress', '', { steps: 'leave_submit' });

    setTimeout(() => {
      setLeaveSubmitSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 1000);
    setTimeout(() => {
      push('assistant', 'leave_apply_success_card');
      setStage('leave_apply_success');
      updateCtx({ status: 'completed' });
    }, 1600);
  };

  const handleLeaveAction = (action: string) => {
    if (stage !== 'leave_summary') return;
    if (action === 'declaration') {
      push('user', 'text', 'Leave & travel declaration');
      setTimeout(() => {
        push('assistant', 'declaration_card');
        setStage('leave_declaration');
      }, 300);
    } else if (action === 'apply_leave') {
      push('user', 'text', 'Apply for leaves');
      setTimeout(() => {
        push('assistant', 'text', "When do you want to apply for leave? You can say 'tomorrow', a specific date like '5 Apr', or a range like '5 Apr to 7 Apr'.");
        setStage('leave_date_ask');
      }, 400);
    } else {
      push('user', 'text', 'Apply official travel dates');
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

  // ── My Rank vs Peers journey ──────────────────────────────────────────

  const startPeersJourney = (userText: string) => {
    push('user', 'text', userText);
    updateCtx({ status: 'active' });
    setStage('rank_loading');

    const init: Step[] = [
      { id: '1', label: 'Fetching your performance data', status: 'running' },
      { id: '2', label: 'Ranking peers in your team',     status: 'pending' },
      { id: '3', label: 'Preparing leaderboard',          status: 'pending' },
    ];
    setRankSteps(init);
    push('assistant', 'progress', '', { steps: 'rank' });

    setTimeout(() => setRankSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : i === 1 ? 'running' : 'pending') as Step['status'],
    }))), 800);
    setTimeout(() => setRankSteps(p => p.map((s, i) => ({
      ...s, status: (i <= 1 ? 'completed' : 'running') as Step['status'],
    }))), 1600);
    setTimeout(() => {
      setRankSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 2400);
    setTimeout(() => {
      push('assistant', 'text', "Here's how you stack up against your team this quarter.");
    }, 2900);
    setTimeout(() => {
      push('assistant', 'leaderboard_card');
    }, 3400);
    setTimeout(() => {
      push('assistant', 'text', "You're ₹4.6L ahead of #4 Amit Shah. Closing the gap with #2 Karan Malhotra needs ₹4.6L more — a strong push this week could move you up.");
      setStage('rank_summary');
      updateCtx({ status: 'completed' });
    }, 4000);
  };

  // ── CD Loan Portfolio performance journey ─────────────────────────────

  const startPortfolioJourney = (userText: string) => {
    push('user', 'text', userText);
    updateCtx({ status: 'active' });
    setStage('portfolio_loading');

    const init: Step[] = [
      { id: '1', label: 'Fetching your target data',        status: 'running' },
      { id: '2', label: 'Calculating MTD achievement',       status: 'pending' },
      { id: '3', label: 'Building performance summary',      status: 'pending' },
    ];
    setPortfolioSteps(init);
    push('assistant', 'progress', '', { steps: 'portfolio' });

    setTimeout(() => setPortfolioSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : i === 1 ? 'running' : 'pending') as Step['status'],
    }))), 700);
    setTimeout(() => setPortfolioSteps(p => p.map((s, i) => ({
      ...s, status: (i <= 1 ? 'completed' : 'running') as Step['status'],
    }))), 1400);
    setTimeout(() => {
      setPortfolioSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 2100);
    setTimeout(() => {
      push('assistant', 'text', "Here's your CD Loan performance summary for this month.");
    }, 2600);
    setTimeout(() => {
      push('assistant', 'target_achievement_card');
    }, 3100);
    setTimeout(() => {
      setStage('portfolio_summary');
      updateCtx({ status: 'completed' });
    }, 3700);
  };

  const startPeersIncentiveJourney = (userText: string) => {
    if (stage !== 'peers_summary') return;
    push('user', 'text', userText);
    setStage('peers_incentive_loading');

    const init: Step[] = [
      { id: '1', label: 'Fetching incentive details', status: 'running' },
    ];
    setPeersIncentiveSteps(init);
    push('assistant', 'progress', '', { steps: 'peers_incentive' });

    setTimeout(() => {
      setPeersIncentiveSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 900);
    setTimeout(() => {
      push('assistant', 'peers_incentive_card');
      setStage('peers_incentive');
      updateCtx({ status: 'completed' });
    }, 1500);
  };

  // ── DO cancellation journey ────────────────────────────────────────────

  const startDOJourney = () => {
    push('assistant', 'text', 'A Delivery Order (DO) is issued once a loan is sanctioned and disbursed to the dealer. It authorises the dealer to release the asset to the customer. DO governance ensures every order follows compliance and policy rules before release.');
    setTimeout(() => {
      push('assistant', 'text', 'What would you like to do?');
      push('assistant', 'do_quick_reply');
      setStage('do_intent');
    }, 400);
  };

  const handleDOIntent = (choice: string) => {
    if (stage !== 'do_intent') return;
    push('user', 'text', choice);
    if (choice === 'Raise a DO Cancellation request') {
      setTimeout(() => {
        push('assistant', 'text', 'Please attach the mail/letter from the dealer requesting DO cancellation via the + button.');
        push('assistant', 'do_upload_card');
        setStage('do_upload');
      }, 350);
    } else {
      setTimeout(() => {
        push('assistant', 'text', "I'll pull up the DO status for your territory. This feature is coming soon.");
        setStage('generic');
      }, 350);
    }
  };

  const handleDOUpload = () => {
    push('user', 'text', 'Document uploaded');
    setStage('do_mail_processing');

    const init: Step[] = [
      { id: '1', label: 'Dealer Mail Verified', status: 'running' },
      { id: '2', label: 'Governance Check', status: 'pending' },
      { id: '3', label: 'QC Check', status: 'pending' },
    ];
    setDoSteps(init);
    push('assistant', 'do_mail_steps');

    setTimeout(() => setDoSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : i === 1 ? 'running' : 'pending') as Step['status'],
    }))), 900);
    setTimeout(() => setDoSteps(p => p.map((s, i) => ({
      ...s, status: (i <= 1 ? 'completed' : 'running') as Step['status'],
    }))), 1800);
    setTimeout(() => {
      setDoSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 2700);
    setTimeout(() => {
      push('assistant', 'text', 'Dealer mail received and verified.');
      push('assistant', 'do_governance_card');
      setStage('do_governance');
    }, 3200);
  };

  const handleDOConfirm = (confirm: boolean) => {
    if (stage !== 'do_governance') return;
    if (confirm) {
      push('user', 'text', 'Confirm Cancellation');
      setTimeout(() => {
        push('assistant', 'do_cancelled_card');
        setStage('do_cancelled');
        updateCtx({ status: 'completed' });
      }, 350);
    } else {
      push('user', 'text', 'Cancel');
      setTimeout(() => {
        push('assistant', 'text', 'DO cancellation request has been discarded. No changes have been made.');
        setStage('generic');
      }, 350);
    }
  };

  // ── Meal claim journey ─────────────────────────────────────────────────

  const startClaimJourney = () => {
    push('assistant', 'text', "Sure! Please upload your meal bill to get started.");
    push('assistant', 'claim_upload_card');
    setStage('claim_bill_upload');
  };

  const handleBillUpload = () => {
    push('user', 'text', 'Bill uploaded');
    setStage('claim_bill_fetching');
    const init: Step[] = [
      { id: '1', label: 'Reading your bill',    status: 'running' },
      { id: '2', label: 'Extracting details',   status: 'pending' },
    ];
    setClaimFetchSteps(init);
    push('assistant', 'claim_fetch_loader');
    setTimeout(() => setClaimFetchSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : 'running') as Step['status'],
    }))), 900);
    setTimeout(() => setClaimFetchSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] }))), 1800);
    setTimeout(() => {
      push('assistant', 'text', `Got it. Please upload the payment proof for ${CLAIM_BILL.vendor}.`);
      push('assistant', 'claim_proof_card');
      setStage('claim_proof_upload');
    }, 2300);
  };

  const handleProofUpload = () => {
    push('user', 'text', 'Payment proof uploaded');
    setStage('claim_proof_fetching');
    const init: Step[] = [
      { id: '1', label: 'Verifying payment proof',    status: 'running' },
      { id: '2', label: 'Cross-checking amount',      status: 'pending' },
    ];
    setClaimProofSteps(init);
    push('assistant', 'claim_proof_loader');
    setTimeout(() => setClaimProofSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : 'running') as Step['status'],
    }))), 900);
    setTimeout(() => setClaimProofSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] }))), 1800);
    setTimeout(() => {
      push('assistant', 'text', 'What kind of bill is this?');
      push('assistant', 'claim_bill_type_chips');
      setStage('claim_bill_type');
    }, 2300);
  };

  const handleBillType = (type: 'Personal bill' | 'Shared bill') => {
    if (stage !== 'claim_bill_type') return;
    push('user', 'text', type);
    setTimeout(() => {
      push('assistant', 'text', "Here are the details I've gathered from your bill:");
      push('assistant', 'claim_review_card');
      setStage('claim_review');
    }, 350);
  };

  const handleClaimConfirm = (confirm: boolean) => {
    if (stage !== 'claim_review') return;
    if (!confirm) {
      push('user', 'text', 'Decline');
      setTimeout(() => {
        push('assistant', 'text', 'Claim request cancelled. No submission has been made.');
        setStage('generic');
      }, 350);
      return;
    }
    push('user', 'text', 'Confirm & Submit');
    setStage('claim_submitting');
    const init: Step[] = [
      { id: '1', label: 'Submitting your claim', status: 'running' },
    ];
    setClaimSubmitSteps(init);
    push('assistant', 'claim_submit_loader');
    setTimeout(() => setClaimSubmitSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] }))), 1000);
    setTimeout(() => {
      push('assistant', 'claim_success_card');
      setStage('claim_submitted');
      updateCtx({ status: 'completed' });
    }, 1600);
  };

  // ── Reset ──────────────────────────────────────────────────────────────

  const handleStartAnotherRequest = () => {
    const resetCtx: B2BContext = { status: 'waiting' };
    setMsgs([]);
    setProcSteps([]);
    setOcrSteps([]);
    setLeaveSteps([]);
    setDoSteps([]);
    setClaimFetchSteps([]);
    setClaimProofSteps([]);
    setClaimSubmitSteps([]);
    setLeaveApplySteps([]);
    setLeaveSubmitSteps([]);
    setPeersSteps([]);
    setPeersIncentiveSteps([]);
    setPortfolioSteps([]);
    setLeaveDate(null);
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

  const handleIntentSend = (query: string) => {
    if (isNameChangeIntent(query)) {
      startJourney(query);
      return;
    }

    if (isPortfolioIntent(query)) {
      startPortfolioJourney(query);
      return;
    }

    if (isRankVsPeersIntent(query) || isPeersIntent(query)) {
      startPeersJourney(query);
      return;
    }

    if (isLeaveApplyIntent(query)) {
      startLeaveApplyJourney(query);
      return;
    }

    if (normalizeIntent(query) === normalizeIntent(LEAVE_BALANCE_TRIGGER)) {
      push('user', 'text', query);
      updateCtx({ status: 'active' });
      setTimeout(() => startLeaveJourney(), 300);
      return;
    }

    if (normalizeIntent(query) === normalizeIntent(DO_GOVERNANCE_TRIGGER)) {
      push('user', 'text', query);
      updateCtx({ status: 'active' });
      setTimeout(() => startDOJourney(), 300);
      return;
    }

    if (isClaimIntent(query)) {
      push('user', 'text', query);
      updateCtx({ status: 'active' });
      setTimeout(() => startClaimJourney(), 300);
      return;
    }

    if (isIncentiveIntent(query)) {
      startPeersIncentiveJourney(query);
      return;
    }

    push('user', 'text', query);
    updateCtx({ status: 'active' });
    setTimeout(() => {
      push('assistant', 'text', "I'll look into that for you. Give me a moment.");
      setStage('generic');
    }, 400);
  };

  const handleHomePromptSend = (query: string) => {
    setActiveCategory(null);
    setPrefillText('');
    handleIntentSend(query);
  };

  const handleChatTraySend = (query: string) => {
    if (stage === 'ask_lan') {
      handleLanSend(query);
      return;
    }

    if (stage === 'leave_date_ask') {
      const parsed = parseLeaveDateInput(query);
      setLeaveDate(parsed);
      startLeaveApplyJourney(query);
      return;
    }

    if (stage === 'peers_summary') {
      if (isClaimIntent(query)) {
        push('user', 'text', query);
        updateCtx({ status: 'active' });
        setTimeout(() => startClaimJourney(), 300);
      } else if (isIncentiveIntent(query)) {
        startPeersIncentiveJourney(query);
      } else {
        push('user', 'text', query);
        setTimeout(() => {
          push('assistant', 'text', "I'll look into that for you. This view is coming soon.");
        }, 400);
      }
      return;
    }

    if (stage === 'generic' || stage === 'success' || stage === 'leave_decl_success' || stage === 'claim_submitted' || stage === 'leave_apply_success' || stage === 'rank_summary' || stage === 'portfolio_summary' || stage === 'do_cancelled') {
      handleIntentSend(query);
    }
  };

  // ── Derived render helpers ─────────────────────────────────────────────

  const lastCaptureId      = msgs.filter(m => m.type === 'capture').at(-1)?.id;
  const lastNameMatchId    = msgs.filter(m => m.type === 'name_match').at(-1)?.id;
  const lastLeaveActionsId = msgs.filter(m => m.type === 'leave_actions').at(-1)?.id;
  const lastDeclCardId     = msgs.filter(m => m.type === 'declaration_card').at(-1)?.id;
  const lastDoQuickReplyId    = msgs.filter(m => m.type === 'do_quick_reply').at(-1)?.id;
  const lastDoUploadId        = msgs.filter(m => m.type === 'do_upload_card').at(-1)?.id;
  const lastDoGovCardId       = msgs.filter(m => m.type === 'do_governance_card').at(-1)?.id;
  const lastClaimUploadId     = msgs.filter(m => m.type === 'claim_upload_card').at(-1)?.id;
  const lastClaimFetchId      = msgs.filter(m => m.type === 'claim_fetch_loader').at(-1)?.id;
  const lastClaimProofId      = msgs.filter(m => m.type === 'claim_proof_card').at(-1)?.id;
  const lastClaimProofLoadId  = msgs.filter(m => m.type === 'claim_proof_loader').at(-1)?.id;
  const lastClaimBillTypeId   = msgs.filter(m => m.type === 'claim_bill_type_chips').at(-1)?.id;
  const lastClaimReviewId     = msgs.filter(m => m.type === 'claim_review_card').at(-1)?.id;
  const lastClaimSubmitLoadId = msgs.filter(m => m.type === 'claim_submit_loader').at(-1)?.id;

  // ── Home screen ────────────────────────────────────────────────────────

  if (stage === 'home') {
    const activeCat = B2B_CATEGORIES.find(c => c.id === activeCategory) ?? null;

    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-8 gap-5 overflow-y-auto">
        <div className="flex flex-col items-center gap-2 text-center">
          <p style={{ fontSize: '32px', fontFamily: "'Lora', serif", fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.2 }}>Hi Rahul</p>
          <h1
            style={{ fontSize: '40px', fontFamily: "'Lora', serif", fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.15 }}
          >
            Where should we start?
          </h1>
        </div>

        <div className="w-full max-w-xl">
          <ChatComposer
            placeholder="Ask Bajaj AI about a process or request"
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
                  if (
                    isNameChangeIntent(prompt.query) ||
                    normalizeIntent(prompt.query) === normalizeIntent(LEAVE_BALANCE_TRIGGER) ||
                    normalizeIntent(prompt.query) === normalizeIntent(DO_GOVERNANCE_TRIGGER) ||
                    normalizeIntent(prompt.query) === normalizeIntent(CLAIM_TRIGGER)
                  ) {
                    handleHomePromptSend(prompt.query);
                    return;
                  }
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
        accept="*/*"
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
              const isLeave           = m.meta?.steps === 'leave';
              const isOcr             = m.meta?.steps === 'ocr';
              const isLeaveApply      = m.meta?.steps === 'leave_apply';
              const isLeaveSubmit     = m.meta?.steps === 'leave_submit';
              const isPeers           = m.meta?.steps === 'peers';
              const isPeersIncentive  = m.meta?.steps === 'peers_incentive';
              const isPortfolio       = m.meta?.steps === 'portfolio';
              const isRank            = m.meta?.steps === 'rank';
              const steps = isLeave          ? leaveSteps
                : isOcr            ? ocrSteps
                : isLeaveApply     ? leaveApplySteps
                : isLeaveSubmit    ? leaveSubmitSteps
                : isPeers          ? peersSteps
                : isPeersIncentive ? peersIncentiveSteps
                : isPortfolio      ? portfolioSteps
                : isRank           ? rankSteps
                : procSteps;
              const title = isLeave          ? 'Fetching leave data'
                : isOcr            ? 'Reading document'
                : isLeaveApply     ? 'Preparing leave application'
                : isLeaveSubmit    ? 'Submitting leave application'
                : isPeers          ? 'Fetching performance data'
                : isPeersIncentive ? 'Fetching incentive details'
                : isPortfolio      ? 'Fetching performance data'
                : isRank           ? 'Fetching leaderboard'
                : 'Checking records';
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
                  <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-bl-none px-5 py-3 shadow-sm text-base"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                    <p className="mb-2">Please provide a valid OVD</p>
                    <ul className="space-y-1 pl-1">
                      {['Aadhar', 'Passport', 'Driving licence', 'Voter ID', 'MNREGA card'].map(doc => (
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
                      {isLive ? 'Upload PDF' : 'Uploaded'}
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
                      {isLive ? 'Click to upload PDF' : 'PDF uploaded'}
                    </button>

                    {isLive && (
                      <div className="flex items-center justify-between mt-3 px-1">
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Upload a clear PDF copy with all text visible and legible
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

                    <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'var(--surface-2)' }}>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                        Document verified and name updated across all systems.
                      </p>
                      <div className="flex flex-col">
                        {[
                          { label: 'Document Received', sub: 'Aadhaar Card — PDF verified' },
                          { label: 'Name Validated',    sub: 'Passed' },
                          { label: 'CRM Updated',       sub: 'Auto-synced' },
                          { label: 'GCD Updated',       sub: 'Complete' },
                        ].map((item, i, arr) => (
                          <div key={item.label} className="flex gap-3">
                            <div className="flex flex-col items-center" style={{ width: '14px' }}>
                              <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: 'var(--status-success)' }} />
                              {i < arr.length - 1 && (
                                <div className="flex-1 w-px mt-1" style={{ backgroundColor: 'var(--status-success)', opacity: 0.25 }} />
                              )}
                            </div>
                            <div className={i < arr.length - 1 ? 'pb-3' : ''}>
                              <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--status-success)' }}>{item.label}</p>
                              <p className="text-xs leading-tight mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.sub}</p>
                            </div>
                          </div>
                        ))}
                      </div>
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

            // ── target vs achievement card ────────────────────────────
            if (m.type === 'target_achievement_card') {
              const rows = [
                { label: 'Monthly Target',        value: '₹150L',      highlight: false },
                { label: 'Achievement (MTD)',      value: '₹128.5L',    highlight: false },
                { label: 'Achievement %',          value: '85.7%',      highlight: true  },
                { label: 'Remaining',              value: '₹21.5L',     highlight: false },
                { label: 'Days Left',              value: '8',          highlight: false },
                { label: 'Required Run Rate',      value: '₹2.7L/day',  highlight: false },
                { label: 'Pipeline (Pending DOs)', value: '₹18.2L',     highlight: false },
              ];
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="w-full mb-3">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        CD Loan Target vs Achievement — Feb 2025
                      </span>
                    </div>
                    {/* Column headers */}
                    <div className="grid grid-cols-2 px-4 py-2"
                      style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Metric</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Value</span>
                    </div>
                    {rows.map((row, i) => (
                      <div key={row.label}
                        className="grid grid-cols-2 px-4 py-3"
                        style={{
                          borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          backgroundColor: row.highlight ? 'rgba(217,119,6,0.08)' : 'transparent',
                        }}>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                        <span className={`text-xs font-semibold tabular-nums${row.highlight ? ' text-amber-600 dark:text-amber-400' : ''}`}
                          style={row.highlight ? {} : { color: 'var(--text-primary)' }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            }

            // ── peers breakdown card ──────────────────────────────────
            if (m.type === 'peers_breakdown_card') {
              const categories = [
                { label: 'Electronics',     value: 'Rs 48.2L' },
                { label: 'Home Appliances', value: 'Rs 38.5L' },
                { label: 'Furniture',       value: 'Rs 27.4L' },
                { label: 'Lifestyle',       value: 'Rs 14.4L' },
              ];
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="w-full mb-3">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                        Category Breakdown — Q1 FY26
                      </span>
                    </div>
                    {categories.map((row, i) => (
                      <div key={row.label} className="flex items-center justify-between px-4 py-2.5"
                        style={{ borderBottom: i < categories.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                      </div>
                    ))}
                    <div className="px-4 py-2.5"
                      style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Top dealers: Croma — Rs 50L &nbsp;·&nbsp; Vijay Sales — Rs 40L
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── leaderboard card ─────────────────────────────────────
            if (m.type === 'leaderboard_card') {
              const rows = [
                { rank: 1,  name: 'Sneha Patil',      ach: '₹145.3L', pct: 96.9, isYou: false },
                { rank: 2,  name: 'Karan Malhotra',   ach: '₹133.1L', pct: 88.7, isYou: false },
                { rank: 3,  name: 'Rahul Shah (You)', ach: '₹128.5L', pct: 85.7, isYou: true  },
                { rank: 4,  name: 'Amit Shah',        ach: '₹122.3L', pct: 81.5, isYou: false },
                { rank: 5,  name: 'Priya Desai',      ach: '₹115.8L', pct: 77.2, isYou: false },
              ];
              const medalColor = (rank: number) =>
                rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#a16207' : 'var(--text-secondary)';
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    {/* Header */}
                    <div className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🏆</span>
                        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                          Team Leaderboard — Q1 FY26
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        You rank 3rd this quarter
                      </p>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem] items-center px-4 py-2"
                      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      {['Rank', 'Name', 'Achievement', 'Ach %'].map(h => (
                        <span key={h} className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{h}</span>
                      ))}
                    </div>

                    {/* Rows */}
                    {rows.map((row, i) => (
                      <div key={row.rank}
                        className="grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem] items-center px-4 py-3"
                        style={{
                          borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          backgroundColor: row.isYou ? 'rgba(124,58,237,0.06)' : 'transparent',
                        }}>
                        {/* Rank badge */}
                        <span className="text-xs font-bold tabular-nums" style={{ color: medalColor(row.rank) }}>
                          #{row.rank}
                        </span>

                        {/* Name */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="text-xs font-medium truncate"
                            style={{ color: row.isYou ? '#7c3aed' : 'var(--text-primary)' }}>
                            {row.name}
                          </span>
                          {row.isYou && <span className="text-xs flex-shrink-0">⭐</span>}
                        </div>

                        {/* Achievement */}
                        <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                          {row.ach}
                        </span>

                        {/* Ach% with mini bar */}
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold tabular-nums" style={{ color: row.isYou ? '#7c3aed' : 'var(--text-primary)' }}>
                            {row.pct}%
                          </span>
                          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-subtle)' }}>
                            <div className="h-full rounded-full"
                              style={{
                                width: `${row.pct}%`,
                                backgroundColor: row.isYou ? '#7c3aed' : 'var(--text-secondary)',
                                opacity: row.isYou ? 1 : 0.45,
                              }} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Footer */}
                    <div className="px-4 py-2.5"
                      style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Showing top 5 of 12 members · Q1 FY26
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── peers incentive card ──────────────────────────────────
            if (m.type === 'peers_incentive_card') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-base">💰</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Incentive Tracker — Q1 FY26</span>
                    </div>

                    {/* Stats */}
                    <div className="rounded-xl p-4 mb-4 space-y-2" style={{ backgroundColor: 'var(--surface-2)' }}>
                      {[
                        { label: 'Accrued',                    value: '₹45,200' },
                        { label: 'Projected (at current pace)', value: '₹62,000' },
                        { label: 'Max Potential',               value: '₹85,000' },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tier text rows */}
                    <div className="space-y-2 mb-4">
                      {[
                        { slab: 'Tier 1', range: '< 80%',   multiplier: '1.0x', icon: '✅', status: 'Cleared',          statusColor: 'var(--status-success)' },
                        { slab: 'Tier 2', range: '80–100%', multiplier: '1.2x', icon: '⭐', status: 'Current',           statusColor: 'var(--status-warning)' },
                        { slab: 'Tier 3', range: '> 100%',  multiplier: '1.5x', icon: '🔒', status: 'Unlock at ₹150L',  statusColor: 'var(--text-secondary)' },
                      ].map(tier => (
                        <div key={tier.slab} className="flex items-center justify-between text-xs px-1">
                          <span className="font-medium w-10" style={{ color: 'var(--text-primary)' }}>{tier.slab}</span>
                          <span className="w-14 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{tier.range}</span>
                          <span className="font-semibold w-10 tabular-nums" style={{ color: 'var(--text-primary)' }}>{tier.multiplier}</span>
                          <span className="font-medium" style={{ color: tier.statusColor }}>{tier.icon} {tier.status}</span>
                        </div>
                      ))}
                    </div>

                    {/* Nudge */}
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      You're in <strong style={{ color: 'var(--text-primary)' }}>Tier 2 (80-100%)</strong>. Cross 100% target to unlock <strong style={{ color: 'var(--text-primary)' }}>1.5x multiplier!</strong>
                    </p>

                  </div>
                </motion.div>
              );
            }

            // ── leave apply confirmation card ─────────────────────────
            if (m.type === 'leave_apply_card') {
              const isLive = stage === 'leave_apply_confirm';
              const details = [
                { label: 'Leave Category',    value: 'Privilege Leave' },
                { label: 'Leave Sub-Category', value: 'Personal Leave' },
                { label: 'Duration',          value: leaveDate?.duration ?? '1 day(s)' },
                { label: 'Date',              value: leaveDate?.dateStr ?? '02 Apr 2026' },
                { label: 'Reason',            value: 'Attending a family function' },
              ];
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    {/* Detail rows */}
                    <div className="rounded-xl p-4 mb-4 space-y-2.5" style={{ backgroundColor: 'var(--surface-2)' }}>
                      {details.map(row => (
                        <div key={row.label} className="flex justify-between items-center text-xs gap-4">
                          <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span className="font-medium text-right" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Warning */}
                    <div className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5"
                      style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
                      <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--status-warning)' }} />
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--status-warning)' }}>
                        Your Privilege Leave balance is <strong>0.75 day(s)</strong>. Applying 0.5 day(s) will leave 0.25 remaining. Excess usage may require LWP approval per policy.
                      </p>
                    </div>

                    {/* Confirm / Cancel buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => isLive && handleLeaveApplyAction(true)}
                        disabled={!isLive}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97]"
                        style={{
                          backgroundColor: isLive ? 'var(--status-success)' : 'var(--surface-2)',
                          color: isLive ? '#ffffff' : 'var(--text-secondary)',
                          cursor: isLive ? 'pointer' : 'default',
                          border: 'none',
                        }}>
                        Confirm
                      </button>
                      <button
                        onClick={() => isLive && handleLeaveApplyAction(false)}
                        disabled={!isLive}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          cursor: isLive ? 'pointer' : 'default',
                          opacity: isLive ? 1 : 0.5,
                        }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── leave apply success card ──────────────────────────────
            if (m.type === 'leave_apply_success_card') {
              const summaryRows = [
                { label: 'Leave Type',  value: 'Privilege Leave – Personal' },
                { label: 'Date',        value: leaveDate?.dateStr ?? '02 Apr 2026' },
                { label: 'Duration',    value: leaveDate?.duration ?? '1 day(s)' },
                { label: 'Reference',   value: 'LV-2026-04821', mono: true },
                { label: 'Status',      value: 'Pending approval' },
              ];
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
                          Leave applied successfully
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Your leave for {leaveDate?.dateStr ?? '02 Apr 2026'} has been submitted
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-4 mb-4 space-y-2" style={{ backgroundColor: 'var(--surface-2)' }}>
                      {summaryRows.map(row => (
                        <div key={row.label} className="flex justify-between items-center text-xs gap-4">
                          <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span className={row.mono ? 'font-mono' : 'font-medium'} style={{ color: 'var(--text-primary)' }}>
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
                        <span className="text-xs font-medium text-center" style={{ color: 'var(--text-primary)' }}>{row.ytd}</span>
                        <span className="text-xs font-medium text-right" style={{ color: 'var(--text-primary)' }}>{row.mtd}</span>
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
                      dates for <span className="font-medium">{DECL_MONTH}</span>. I confirm
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

            // ── DO quick reply chips ──────────────────────────────────
            if (m.type === 'do_quick_reply') {
              const isLive = stage === 'do_intent' && m.id === lastDoQuickReplyId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut', delay: 0.06 }}
                  className="flex flex-wrap gap-2 mb-4">
                  {['Check DO Status', 'Raise a DO Cancellation request'].map(choice => (
                    <button
                      key={choice}
                      onClick={() => isLive && handleDOIntent(choice)}
                      disabled={!isLive}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        opacity: isLive ? 1 : 0.5,
                        cursor: isLive ? 'pointer' : 'default',
                      }}>
                      {choice}
                    </button>
                  ))}
                </motion.div>
              );
            }

            // ── DO upload card ────────────────────────────────────────
            if (m.type === 'do_upload_card') {
              const isLive = stage === 'do_upload' && m.id === lastDoUploadId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText size={16} style={{ color: 'var(--brand-blue)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Dealer cancellation letter
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
                      {isLive ? 'Attach Document' : 'Attached'}
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
                      {isLive ? 'Click to attach dealer letter' : 'Document attached'}
                    </button>
                    {isLive && (
                      <div className="flex items-center justify-between mt-3 px-1">
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Accepted formats: PDF, JPG, PNG
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

            // ── DO mail processing steps ──────────────────────────────
            if (m.type === 'do_mail_steps') {
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Verifying dealer mail" steps={doSteps} />
                </div>
              );
            }

            // ── DO governance card ────────────────────────────────────
            if (m.type === 'do_governance_card') {
              const isLive = stage === 'do_governance' && m.id === lastDoGovCardId;
              const timelineNodes = [
                { label: 'Dealer Mail Verified', sub: 'dealer_cancellation_letter.pdf' },
                { label: 'Governance', sub: 'Passed' },
                { label: 'QC Check', sub: 'Passed' },
                { label: 'DO Cancelled', sub: 'Complete · Stakeholders notified' },
              ];
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(37,99,235,0.1)' }}>
                        <Store size={15} style={{ color: 'var(--brand-blue)' }} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        DO Cancellation Summary
                      </span>
                    </div>

                    <div className="rounded-xl p-4 mb-5 space-y-2" style={{ backgroundColor: 'var(--surface-2)' }}>
                      {[
                        { label: 'LAN',    value: DO_LAN,    mono: true },
                        { label: 'Dealer', value: DO_DEALER, mono: false },
                        { label: 'Trip',   value: DO_TRIP,   mono: false },
                        { label: 'Reason', value: 'Dealer cancellation request', mono: false },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span className={row.mono ? 'font-mono' : ''} style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mb-5">
                      {timelineNodes.map((node, i) => (
                        <motion.div
                          key={node.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.22, delay: 0.1 + i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                              style={{ backgroundColor: 'var(--status-success)' }} />
                            {i < timelineNodes.length - 1 && (
                              <div className="w-px min-h-[24px] flex-1"
                                style={{ backgroundColor: 'rgba(22,163,74,0.3)' }} />
                            )}
                          </div>
                          <div className="pb-4">
                            <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{node.label}</div>
                            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{node.sub}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {isLive && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: 0.5 }}
                        className="flex gap-3">
                        <button
                          onClick={() => handleDOConfirm(true)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
                          style={{ backgroundColor: 'var(--brand-blue)' }}>
                          <CheckCircle2 size={14} />
                          Confirm Cancellation
                        </button>
                        <button
                          onClick={() => handleDOConfirm(false)}
                          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                          Cancel
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            }

            // ── DO cancelled success ──────────────────────────────────
            if (m.type === 'do_cancelled_card') {
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
                          DO Cancelled Successfully
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          LAN: {DO_LAN}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-4 mb-4 space-y-2" style={{ backgroundColor: 'var(--surface-2)' }}>
                      {[
                        { label: 'Reference ID',  value: 'DOC-2026-04821',  mono: true },
                        { label: 'Dealer',         value: DO_DEALER,         mono: false },
                        { label: 'Cancelled on',   value: 'Today, 3:42 PM',  mono: false },
                        { label: 'Stakeholders',   value: 'Notified',        mono: false },
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

            // ── claim bill upload card ────────────────────────────────
            if (m.type === 'claim_upload_card') {
              const isLive = stage === 'claim_bill_upload' && m.id === lastClaimUploadId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Upload size={15} style={{ color: 'var(--brand-blue)' }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Upload Meal Bill</span>
                    </div>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Accepted formats: PDF, JPG, PNG · Max file size: <strong>5 MB</strong>
                    </p>
                    <button
                      onClick={isLive ? () => fileInputRef.current?.click() : undefined}
                      disabled={!isLive}
                      className="w-full flex flex-col items-center justify-center gap-2 py-7 rounded-xl border-2 border-dashed transition-all"
                      style={{
                        borderColor: isLive ? 'var(--brand-blue)' : 'var(--border)',
                        backgroundColor: isLive ? 'rgba(37,99,235,0.04)' : 'var(--surface-2)',
                        cursor: isLive ? 'pointer' : 'default',
                        opacity: isLive ? 1 : 0.5,
                      }}>
                      <Upload size={22} style={{ color: isLive ? 'var(--brand-blue)' : 'var(--text-secondary)' }} />
                      <span className="text-sm font-medium" style={{ color: isLive ? 'var(--brand-blue)' : 'var(--text-secondary)' }}>
                        Tap to upload your bill
                      </span>
                    </button>
                  </div>
                </motion.div>
              );
            }

            // ── claim bill fetch loader ───────────────────────────────
            if (m.type === 'claim_fetch_loader') {
              const steps = m.id === lastClaimFetchId ? claimFetchSteps : claimFetchSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Analysing your bill" steps={steps} />
                </div>
              );
            }

            // ── claim payment proof card ──────────────────────────────
            if (m.type === 'claim_proof_card') {
              const isLive = stage === 'claim_proof_upload' && m.id === lastClaimProofId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={15} style={{ color: 'var(--brand-blue)' }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Payment Proof — {CLAIM_BILL.vendor}
                      </span>
                    </div>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                      UPI screenshot, bank statement or card receipt · Accepted: PDF, JPG, PNG · Max <strong>5 MB</strong>
                    </p>
                    <button
                      onClick={isLive ? () => fileInputRef.current?.click() : undefined}
                      disabled={!isLive}
                      className="w-full flex flex-col items-center justify-center gap-2 py-7 rounded-xl border-2 border-dashed transition-all"
                      style={{
                        borderColor: isLive ? 'var(--brand-blue)' : 'var(--border)',
                        backgroundColor: isLive ? 'rgba(37,99,235,0.04)' : 'var(--surface-2)',
                        cursor: isLive ? 'pointer' : 'default',
                        opacity: isLive ? 1 : 0.5,
                      }}>
                      <Upload size={22} style={{ color: isLive ? 'var(--brand-blue)' : 'var(--text-secondary)' }} />
                      <span className="text-sm font-medium" style={{ color: isLive ? 'var(--brand-blue)' : 'var(--text-secondary)' }}>
                        Tap to upload payment proof
                      </span>
                    </button>
                  </div>
                </motion.div>
              );
            }

            // ── claim proof loader ────────────────────────────────────
            if (m.type === 'claim_proof_loader') {
              const steps = m.id === lastClaimProofLoadId ? claimProofSteps : claimProofSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Verifying payment proof" steps={steps} />
                </div>
              );
            }

            // ── claim bill type chips ─────────────────────────────────
            if (m.type === 'claim_bill_type_chips') {
              const isLive = stage === 'claim_bill_type' && m.id === lastClaimBillTypeId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2 mb-4">
                  {(['Personal bill', 'Shared bill'] as const).map(opt => (
                    <button key={opt}
                      onClick={() => isLive && handleBillType(opt)}
                      disabled={!isLive}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        opacity: isLive ? 1 : 0.45,
                        cursor: isLive ? 'pointer' : 'default',
                      }}>
                      {opt}
                    </button>
                  ))}
                </motion.div>
              );
            }

            // ── claim review card ─────────────────────────────────────
            if (m.type === 'claim_review_card') {
              const isLive = stage === 'claim_review' && m.id === lastClaimReviewId;
              const rows = [
                { label: 'Vendor',    value: CLAIM_BILL.vendor   },
                { label: 'Bill No',   value: CLAIM_BILL.billNo   },
                { label: 'Date',      value: CLAIM_BILL.date     },
                { label: 'Category',  value: CLAIM_BILL.category },
                { label: 'Amount',    value: CLAIM_BILL.amount   },
                { label: 'GST (18%)', value: CLAIM_BILL.gst      },
                { label: 'Total',     value: CLAIM_BILL.total,   bold: true },
              ];
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="px-5 py-3.5"
                      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Bill Details</span>
                    </div>
                    {rows.map((row, i) => (
                      <motion.div key={row.label}
                        initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18, delay: 0.05 + i * 0.06 }}
                        className="flex items-center justify-between px-5 py-3"
                        style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                        <span
                          className="text-xs tabular-nums"
                          style={{ color: 'var(--text-primary)', fontWeight: row.bold ? 700 : 500 }}>
                          {row.value}
                        </span>
                      </motion.div>
                    ))}
                    <div className="flex gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => isLive && handleClaimConfirm(true)}
                        disabled={!isLive}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                          backgroundColor: isLive ? 'var(--brand-blue)' : 'var(--surface-2)',
                          color: isLive ? '#fff' : 'var(--text-secondary)',
                          cursor: isLive ? 'pointer' : 'default',
                        }}>
                        Confirm &amp; Submit
                      </button>
                      <button
                        onClick={() => isLive && handleClaimConfirm(false)}
                        disabled={!isLive}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                          cursor: isLive ? 'pointer' : 'default',
                          opacity: isLive ? 1 : 0.45,
                        }}>
                        Decline
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── claim submit loader ───────────────────────────────────
            if (m.type === 'claim_submit_loader') {
              const steps = m.id === lastClaimSubmitLoadId ? claimSubmitSteps : claimSubmitSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Submitting claim" steps={steps} />
                </div>
              );
            }

            // ── claim success card ────────────────────────────────────
            if (m.type === 'claim_success_card') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-full mb-4">
                  <div className="rounded-2xl p-6 text-center"
                    style={{ backgroundColor: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)' }}>
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(22,163,74,0.12)' }}>
                        <CheckCircle2 size={26} style={{ color: '#16a34a' }} />
                      </div>
                    </div>
                    <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      Claim Submitted Successfully
                    </p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Your meal claim for <strong>{CLAIM_BILL.vendor}</strong> ({CLAIM_BILL.total}) has been submitted for approval.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium mb-4"
                      style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <span>Ref: <strong style={{ color: 'var(--text-primary)' }}>{CLAIM_BILL.ref}</strong></span>
                      <span>·</span>
                      <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
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

          {(stage === 'peers_incentive' || stage === 'rank_summary' || stage === 'portfolio_summary') && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex justify-center mt-2 mb-4">
              <button
                onClick={handleStartAnotherRequest}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all hover:opacity-80 active:scale-[0.97]"
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                <RefreshCw size={13} />
                Start new chat
              </button>
            </motion.div>
          )}

          <div ref={endRef} className="h-4" />
        </div>
      </div>

      {/* Bottom tray */}
      <div className="shrink-0 border-t px-4 py-4"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-2xl mx-auto">
          <ChatComposer
            placeholder={
              stage === 'ask_lan'             ? 'Enter 10-digit Loan Account Number' :
              stage === 'doc_capturing'       ? 'Upload the supporting PDF document above' :
              stage === 'name_confirm'        ? 'Reply using the options above' :
              stage === 'leave_summary'          ? 'Choose an option above' :
              stage === 'leave_declaration'      ? 'Reply using the options above' :
              stage === 'peers_summary'           ? 'Ask about your incentives or performance…' :
              stage === 'rank_summary'            ? 'What would you like to do next?' :
              stage === 'portfolio_summary'       ? 'What would you like to do next?' :
              stage === 'leave_date_ask'          ? "e.g. 'tomorrow', '5 Apr', '5–7 Apr'" :
              stage === 'leave_apply_confirm'    ? 'Confirm or cancel above' :
              stage === 'leave_apply_submitting' ? 'Submitting…' :
              stage === 'do_intent'           ? 'Choose an option above' :
              stage === 'do_upload'           ? 'Attach the dealer letter above' :
              stage === 'do_governance'         ? 'Review and confirm above' :
              stage === 'claim_bill_upload'     ? 'Upload your meal bill above' :
              stage === 'claim_proof_upload'    ? 'Upload payment proof above' :
              stage === 'claim_bill_type'       ? 'Choose bill type above' :
              stage === 'claim_review'          ? 'Confirm or decline above' :
              (stage === 'success' || stage === 'leave_decl_success' || stage === 'do_cancelled' || stage === 'claim_submitted' || stage === 'leave_apply_success' || stage === 'generic')
                                                ? 'What would you like to do next?' :
              'Processing…'
            }
            disabled={
              stage !== 'ask_lan' &&
              stage !== 'leave_date_ask' &&
              stage !== 'success' &&
              stage !== 'generic' &&
              stage !== 'leave_decl_success' &&
              stage !== 'do_cancelled' &&
              stage !== 'claim_submitted' &&
              stage !== 'leave_apply_success' &&
              stage !== 'peers_summary' &&
              stage !== 'rank_summary' &&
              stage !== 'portfolio_summary'
            }
            onSendMessage={handleChatTraySend}
            onNewConversation={handleStartAnotherRequest}
          />
        </div>
      </div>
    </div>
  );
}
