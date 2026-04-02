import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Banknote,
  Users,
  Database,
} from 'lucide-react';
import { ProgressCard } from './sales-helpline/SalesComponents';
import type { Step } from './sales-helpline/SalesComponents';
import { ChatComposer } from './ChatComposer';
import { UserMessageBubble } from './UserMessageBubble';
import { BotMessageText } from './BotMessageText';
import { SuggestiveActions, type SuggestiveCategory } from './SuggestiveActions';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  isLoading?: boolean;
  variant?:
    | 'text'
    | 'summary_card'
    | 'chips'
    | 'deviation_table'
    | 'dev_loader'
    | 'disbursal_loader'
    | 'disbursal_snapshot'
    | 'disbursal_followups'
    | 'product_details_loader'
    | 'product_details_table'
    | 'pending_approvals_loader'
    | 'pending_approvals_table'
    | 'branch_perf_loader'
    | 'branch_perf_table';
}

type BotStage =
  | 'idle'
  | 'dev_l1' | 'dev_progress' | 'dev_l3' | 'dev_chips'
  | 'topdev_l1' | 'topdev_l2' | 'topdev_table'
  | 'disbursal_loading'
  | 'disbursal_followups'
  | 'product_details_loading'
  | 'product_details_table'
  | 'pending_approvals_loading'
  | 'pending_approvals_table'
  | 'branch_perf_loading'
  | 'branch_perf_table'
  | 'done';

const DEV_SUMMARY_QUERY = 'Show me a summary of all credit deviations raised under my region this month';
const TOP_DEV_QUERY = 'What are the top deviations';
const PRODUCT_WISE_DISBURSAL_QUERY = 'Give me a product-wise breakdown of disbursals this month — personal loans, business loans, CD, and others';
const PRODUCT_WISE_DETAILS_QUERY = 'Show product-wise details';
const HIGHEST_APPROVAL_QUERY = 'Which product has the highest approval rate?';
const BUSINESS_LOAN_TAT_QUERY = 'Why are Business Loans slower on TAT?';
const PENDING_APPROVALS_QUERY = 'How many credit deviations are currently pending my approval? Show me the oldest ones first';
const BRANCH_PERF_QUERY = 'Show me branch-wise credit ops performance this month — TAT, deviation rate, and disbursal volume';

const PENDING_APPROVALS_DATA = [
  {
    caseId: 'CD-102345',
    date: '28-Mar-2026',
    reason: 'Income Mismatch',
    explanation: 'ITR and salary slip mismatch of ₹1,000',
    link: 'View in SFDC',
  },
  {
    caseId: 'CD-102678',
    date: '29-Mar-2026',
    reason: 'Negative Area',
    explanation: 'Customer address falls under Dharavi, marked as a negative region',
    link: 'View in SFDC',
  },
];

const DEVIATION_TABLE_DATA = [
  { type: 'Income mismatch',        cases: 14, share: '30%', context: 'Data capture / document mismatch' },
  { type: 'KYC document mismatch',  cases: 11, share: '24%', context: 'Upload quality' },
  { type: 'Banking variance',       cases: 9,  share: '20%', context: 'Statement interpretation' },
  { type: 'Policy override',        cases: 7,  share: '15%', context: 'Business exceptions' },
  { type: 'Others',                 cases: 5,  share: '11%', context: 'Mixed' },
];

const DISBURSAL_FOLLOWUPS = [
  HIGHEST_APPROVAL_QUERY,
  BUSINESS_LOAN_TAT_QUERY,
] as const;

const DISBURSAL_PRODUCT_ROWS = [
  { product: 'Personal Loans', applications: 420, approval: '76%', disbursal: '28.6' },
  { product: 'Business Loans', applications: 210, approval: '61%', disbursal: '18.4' },
  { product: 'Consumer Durable', applications: 360, approval: '88%', disbursal: '21.4' },
  { product: 'Two-Wheeler', applications: 90, approval: '82%', disbursal: '6.3' },
  { product: 'EMI Card', applications: 180, approval: '92%', disbursal: '12.1' },
  { product: 'Others', applications: 20, approval: '70%', disbursal: '2.0' },
] as const;

const buildSteps = (labels: string[]): Step[] =>
  labels.map((label, index) => ({
    id: `step-${index + 1}`,
    label,
    status: index === 0 ? 'running' : 'pending',
  }));

const DEV_LOADER_STEPS = [
  'Checking deviation records in Credit Ops DB',
  'Querying SLA tracker and case management system',
  'Pulling branch-level data from Risk Analytics DB',
];

const DISBURSAL_LOADER_STEPS = [
  'Pulling MTD disbursal volumes',
  'Aggregating product-wise performance',
  'Checking approval and TAT trends',
];

const PRODUCT_DETAILS_LOADER_STEPS = [
  'Preparing product application counts',
  'Calculating approval conversion rates',
  'Compiling disbursal values by product',
] as const;

const PENDING_APPROVALS_LOADER_STEPS = [
  'Querying approval queue in Credit Ops DB',
  'Fetching case details and deviation reasons',
  'Sorting cases by oldest submission date',
] as const;

const BRANCH_PERF_LOADER_STEPS = [
  'Fetching branch case data',
  'Calculating deviation rates',
  'Preparing branch summary',
] as const;

const BRANCH_PERF_DATA = [
  { branch: 'Hadapsar',    cases: 50, deviations: 6, pct: '12%', reasons: 'LTV beyond eligibility, Approval amount > FOIR' },
  { branch: 'Kharadi',     cases: 50, deviations: 3, pct: '6%',  reasons: 'Repayment account mismatch, Minor documentation gaps' },
  { branch: 'Viman Nagar', cases: 50, deviations: 5, pct: '10%', reasons: 'Approval amount > eligibility, ABB shortfall' },
  { branch: 'Wagholi',     cases: 50, deviations: 2, pct: '4%',  reasons: 'One-off policy exception, Process lapse' },
  { branch: 'Chakan',      cases: 50, deviations: 4, pct: '8%',  reasons: 'LTV deviation, Manual override without note' },
] as const;

const RCOMMS_CATEGORIES: SuggestiveCategory[] = [
  {
    id: 'deviations',
    label: 'Open Deviations',
    Icon: ShieldCheck,
    prompts: [
      {
        label: 'My Pending Approvals',
        query: 'How many credit deviations are currently pending my approval? Show me the oldest ones first',
      },
      {
        label: 'Top Deviation reasons',
        query: 'What are the top reasons for credit deviations in my region? Break it down by category',
      },
      {
        label: 'Region wise deviations',
        query: 'Give me a region-wise breakdown of credit deviations for the current month',
      },
      {
        label: 'Branch wise deviations',
        query: 'Show me branch-wise deviation data — which branches have the highest deviation count this month?',
      },
    ],
  },
  {
    id: 'disbursal',
    label: 'Approval Summary',
    Icon: Banknote,
    prompts: [
      {
        label: 'Today / MTD / YTD disbursal',
        query: "Show me today's disbursal numbers along with month-to-date and year-to-date totals",
      },
      {
        label: 'Product-wise disbursal',
        query: 'Give me a product-wise breakdown of disbursals this month — personal loans, business loans, CD, and others',
      },
      {
        label: 'Region / branch split',
        query: 'Show me disbursal split by region and branch for the current month',
      },
      {
        label: 'TAT summary',
        query: 'What is the average TAT for loan disbursals this month? Show me cases breaching TAT',
      },
      {
        label: 'STP vs Manual cases',
        query: 'How many cases were processed via STP vs manual this month? Show me the STP leakage rate',
      },
    ],
  },
  {
    id: 'hr',
    label: 'HR',
    Icon: Users,
    prompts: [
      {
        label: 'Manage my leaves',
        query: 'Show my leave balance',
      },
      {
        label: 'My claims',
        query: 'I want to raise a meal claim',
      },
      {
        label: 'Policy related information',
        query: 'I have a policy related question, could you help me out',
      },
      {
        label: 'Check my incentives',
        query: 'Show me a breakdown of my earned sales incentives for quarter 2',
      },
      {
        label: 'Check hierarchy',
        query: 'Show me the complete reporting structure for my department',
      },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    Icon: Database,
    prompts: [
      {
        label: 'Case count by status',
        query: 'Show me a count of credit ops cases grouped by status — pending, in review, approved, rejected',
      },
      {
        label: 'Pending queue',
        query: 'What is the current pending queue size? Show me cases sorted by ageing',
      },
      {
        label: 'Ageing buckets',
        query: 'Break down the pending credit ops queue into ageing buckets — 0–24h, 24–48h, and beyond 48h',
      },
      {
        label: 'Branch performance',
        query: 'Show me branch-wise credit ops performance this month — TAT, deviation rate, and disbursal volume',
      },
      {
        label: 'Custom filters',
        query: 'I want to filter credit ops data by date range, product type, and region. Can you help me set that up?',
      },
    ],
  },
];

export function RcommsChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [botStage, setBotStage] = useState<BotStage>('idle');
  const [prefillText, setPrefillText] = useState('');
  const [composerPlaceholder, setComposerPlaceholder] = useState<string | undefined>(undefined);
  const [devSteps, setDevSteps] = useState<Step[]>(() => buildSteps([...DEV_LOADER_STEPS]));
  const [disbursalSteps, setDisbursalSteps] = useState<Step[]>(() => buildSteps([...DISBURSAL_LOADER_STEPS]));
  const [productDetailsSteps, setProductDetailsSteps] = useState<Step[]>(() => buildSteps([...PRODUCT_DETAILS_LOADER_STEPS]));
  const [pendingApprovalsSteps, setPendingApprovalsSteps] = useState<Step[]>(() => buildSteps([...PENDING_APPROVALS_LOADER_STEPS]));
  const [branchPerfSteps, setBranchPerfSteps] = useState<Step[]>(() => buildSteps([...BRANCH_PERF_LOADER_STEPS]));
  const [actionedCases, setActionedCases] = useState<Record<string, 'approved' | 'rejected'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = (text: string) => {
    setPrefillText('');
    setMessages(prev => [...prev, { id: Date.now().toString(), text, type: 'user', variant: 'text' }]);
    if (text === PRODUCT_WISE_DISBURSAL_QUERY) {
      setBotStage('disbursal_loading');
    } else if (text === PRODUCT_WISE_DETAILS_QUERY) {
      setBotStage('product_details_loading');
    } else if (text === DEV_SUMMARY_QUERY) {
      setBotStage('dev_l1');
    } else if (text === TOP_DEV_QUERY) {
      setBotStage('topdev_l1');
    } else if (text === HIGHEST_APPROVAL_QUERY) {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        text: 'EMI Card is currently leading at 92% approval, followed by Consumer Durable at 88% and Two-Wheeler at 82%.',
        type: 'assistant',
        variant: 'text',
      }]);
      setBotStage('done');
    } else if (text === BUSINESS_LOAN_TAT_QUERY) {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        text: 'Business Loans are taking longer because they require more manual underwriting, additional document checks, and higher exception handling than the retail products.',
        type: 'assistant',
        variant: 'text',
      }]);
      setBotStage('done');
    } else if (text === PENDING_APPROVALS_QUERY) {
      setBotStage('pending_approvals_loading');
    } else if (text === BRANCH_PERF_QUERY) {
      setBotStage('branch_perf_loading');
    } else {
      setBotStage('dev_l1');
    }
  };

  const handleChipSelect = (chip: string) => {
    handleSendMessage(chip);
  };

  const handleCaseAction = (caseId: string, action: 'approve' | 'reject') => {
    setActionedCases(prev => ({ ...prev, [caseId]: action === 'approve' ? 'approved' : 'rejected' }));
    const label = action === 'approve' ? 'Approve' : 'Reject';
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      text: `${label} ${caseId}`,
      type: 'user',
      variant: 'text',
    }]);
    const botText = action === 'approve'
      ? `Case ${caseId} has been approved successfully. It will now move to the disbursement queue.`
      : `Case ${caseId} has been rejected. The applicant will be notified with the reason.`;
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        text: botText,
        type: 'assistant',
        variant: 'text',
      }]);
    }, 600);
  };

  useEffect(() => {
    if (botStage === 'idle') return;

    // ── Flow 1: Deviation Summary ──────────────────────────────────────────
    if (botStage === 'dev_l1') {
      const t = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          text: 'On it, Amit.',
          type: 'assistant',
          variant: 'text',
        }]);
        setBotStage('dev_progress');
      }, 400);
      return () => clearTimeout(t);
    }

    if (botStage === 'dev_progress') {
      const loaderId = 'bot-loader-dev';
      setDevSteps(buildSteps([...DEV_LOADER_STEPS]));
      setMessages(prev => [...prev, {
        id: loaderId,
        text: '',
        type: 'assistant',
        variant: 'dev_loader',
      }]);

      const t1 = setTimeout(() => {
        setDevSteps([
          { id: 'step-1', label: DEV_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: DEV_LOADER_STEPS[1], status: 'running' },
          { id: 'step-3', label: DEV_LOADER_STEPS[2], status: 'pending' },
        ]);
      }, 700);

      const t2 = setTimeout(() => {
        setDevSteps([
          { id: 'step-1', label: DEV_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: DEV_LOADER_STEPS[1], status: 'completed' },
          { id: 'step-3', label: DEV_LOADER_STEPS[2], status: 'running' },
        ]);
      }, 1400);

      const t3 = setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== loaderId),
          {
            id: `bot-${Date.now()}`,
            text: 'Here are your deviations',
            type: 'assistant',
            variant: 'summary_card',
          },
        ]);
        setBotStage('dev_l3');
      }, 2400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    if (botStage === 'dev_l3') {
      const t = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-chips-${Date.now()}`,
          text: '',
          type: 'assistant',
          variant: 'chips',
        }]);
        setBotStage('dev_chips');
      }, 600);
      return () => clearTimeout(t);
    }

    if (botStage === 'dev_chips') {
      setComposerPlaceholder('Ask a follow-up about your deviations...');
      setBotStage('done');
      return;
    }

    // ── Flow 2: Top Deviations Table ───────────────────────────────────────
    if (botStage === 'topdev_l1') {
      const t = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          text: 'Here you go.',
          type: 'assistant',
          variant: 'text',
        }]);
        setBotStage('topdev_l2');
      }, 400);
      return () => clearTimeout(t);
    }

    if (botStage === 'topdev_l2') {
      const loaderId = 'bot-loader-topdev';
      const t = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: loaderId,
          text: 'Fetching deviation breakdown...',
          type: 'assistant',
          isLoading: true,
          variant: 'text',
        }]);
        const t2 = setTimeout(() => {
          setMessages(prev => [
            ...prev.filter(m => m.id !== loaderId),
            {
              id: `bot-${Date.now()}`,
              text: 'Here are the top deviation types across your region this month:',
              type: 'assistant',
              variant: 'deviation_table',
            },
          ]);
          setBotStage('topdev_table');
        }, 3500);
        return () => clearTimeout(t2);
      }, 500);
      return () => clearTimeout(t);
    }

    if (botStage === 'topdev_table') {
      setComposerPlaceholder('Explore specific deviation categories or branches...');
      setBotStage('done');
      return;
    }

    // ── Flow 3: Product-wise disbursal snapshot ───────────────────────────
    if (botStage === 'disbursal_loading') {
      const loaderId = `bot-loader-disbursal-${Date.now()}`;
      setDisbursalSteps(buildSteps([...DISBURSAL_LOADER_STEPS]));
      setComposerPlaceholder('Ask a follow-up about disbursal performance...');
      setMessages(prev => [...prev, {
        id: loaderId,
        text: '',
        type: 'assistant',
        variant: 'disbursal_loader',
      }]);

      const t1 = setTimeout(() => {
        setDisbursalSteps([
          { id: 'step-1', label: DISBURSAL_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: DISBURSAL_LOADER_STEPS[1], status: 'running' },
          { id: 'step-3', label: DISBURSAL_LOADER_STEPS[2], status: 'pending' },
        ]);
      }, 700);

      const t2 = setTimeout(() => {
        setDisbursalSteps([
          { id: 'step-1', label: DISBURSAL_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: DISBURSAL_LOADER_STEPS[1], status: 'completed' },
          { id: 'step-3', label: DISBURSAL_LOADER_STEPS[2], status: 'running' },
        ]);
      }, 1400);

      const t3 = setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== loaderId),
          {
            id: `bot-${Date.now()}`,
            text: 'Product Snapshot (MTD)',
            type: 'assistant',
            variant: 'disbursal_snapshot',
          },
        ]);
      }, 2400);

      const t4 = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          text: 'Personal Loans are leading disbursal volumes, while Business Loans are trailing on approval rate and turnaround efficiency.',
          type: 'assistant',
          variant: 'product_details_table',
        }]);
        setBotStage('disbursal_followups');
      }, 2800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }

    if (botStage === 'disbursal_followups') {
      const t = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-followups-${Date.now()}`,
          text: '',
          type: 'assistant',
          variant: 'disbursal_followups',
        }]);
        setBotStage('done');
      }, 250);
      return () => clearTimeout(t);
    }

    // ── Flow 4: Product-wise detail table ────────────────────────────────
    if (botStage === 'product_details_loading') {
      const loaderId = `bot-loader-product-details-${Date.now()}`;
      setProductDetailsSteps(buildSteps([...PRODUCT_DETAILS_LOADER_STEPS]));
      setComposerPlaceholder('Explore product-level disbursal performance...');
      setMessages(prev => [...prev, {
        id: loaderId,
        text: '',
        type: 'assistant',
        variant: 'product_details_loader',
      }]);

      const t1 = setTimeout(() => {
        setProductDetailsSteps([
          { id: 'step-1', label: PRODUCT_DETAILS_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: PRODUCT_DETAILS_LOADER_STEPS[1], status: 'running' },
          { id: 'step-3', label: PRODUCT_DETAILS_LOADER_STEPS[2], status: 'pending' },
        ]);
      }, 650);

      const t2 = setTimeout(() => {
        setProductDetailsSteps([
          { id: 'step-1', label: PRODUCT_DETAILS_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: PRODUCT_DETAILS_LOADER_STEPS[1], status: 'completed' },
          { id: 'step-3', label: PRODUCT_DETAILS_LOADER_STEPS[2], status: 'running' },
        ]);
      }, 1250);

      const t3 = setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== loaderId),
          {
            id: `bot-${Date.now()}`,
            text: 'Personal Loans are leading disbursal volumes, while Business Loans are trailing on approval rate and turnaround efficiency.',
            type: 'assistant',
            variant: 'product_details_table',
          },
        ]);
        setBotStage('product_details_table');
      }, 2150);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    if (botStage === 'product_details_table') {
      setBotStage('done');
      return;
    }

    // ── Flow 5: Pending Approvals Table ──────────────────────────────────
    if (botStage === 'pending_approvals_loading') {
      const loaderId = `bot-loader-pending-approvals-${Date.now()}`;
      setPendingApprovalsSteps(buildSteps([...PENDING_APPROVALS_LOADER_STEPS]));
      setComposerPlaceholder('Ask about a specific case or take action...');
      setMessages(prev => [...prev, {
        id: loaderId,
        text: '',
        type: 'assistant',
        variant: 'pending_approvals_loader',
      }]);

      const t1 = setTimeout(() => {
        setPendingApprovalsSteps([
          { id: 'step-1', label: PENDING_APPROVALS_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: PENDING_APPROVALS_LOADER_STEPS[1], status: 'running' },
          { id: 'step-3', label: PENDING_APPROVALS_LOADER_STEPS[2], status: 'pending' },
        ]);
      }, 700);

      const t2 = setTimeout(() => {
        setPendingApprovalsSteps([
          { id: 'step-1', label: PENDING_APPROVALS_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: PENDING_APPROVALS_LOADER_STEPS[1], status: 'completed' },
          { id: 'step-3', label: PENDING_APPROVALS_LOADER_STEPS[2], status: 'running' },
        ]);
      }, 1400);

      const t3 = setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== loaderId),
          {
            id: `bot-${Date.now()}`,
            text: 'You have 2 pending credit deviation approvals. Here are the oldest ones first:',
            type: 'assistant',
            variant: 'pending_approvals_table',
          },
        ]);
        setBotStage('pending_approvals_table');
      }, 2400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    if (botStage === 'pending_approvals_table') {
      setBotStage('done');
      return;
    }

    // ── Flow 6: Branch Performance ────────────────────────────────────────
    if (botStage === 'branch_perf_loading') {
      const loaderId = `bot-loader-branch-perf-${Date.now()}`;
      setBranchPerfSteps(buildSteps([...BRANCH_PERF_LOADER_STEPS]));
      setMessages(prev => [...prev, {
        id: loaderId,
        text: '',
        type: 'assistant',
        variant: 'branch_perf_loader',
      }]);

      const t1 = setTimeout(() => {
        setBranchPerfSteps([
          { id: 'step-1', label: BRANCH_PERF_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: BRANCH_PERF_LOADER_STEPS[1], status: 'running' },
          { id: 'step-3', label: BRANCH_PERF_LOADER_STEPS[2], status: 'pending' },
        ]);
      }, 700);

      const t2 = setTimeout(() => {
        setBranchPerfSteps([
          { id: 'step-1', label: BRANCH_PERF_LOADER_STEPS[0], status: 'completed' },
          { id: 'step-2', label: BRANCH_PERF_LOADER_STEPS[1], status: 'completed' },
          { id: 'step-3', label: BRANCH_PERF_LOADER_STEPS[2], status: 'running' },
        ]);
      }, 1400);

      const t3 = setTimeout(() => {
        setBranchPerfSteps(prev => prev.map(s => ({ ...s, status: 'completed' as Step['status'] })));
      }, 2400);

      const t4 = setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== loaderId),
          {
            id: `bot-${Date.now()}`,
            text: '',
            type: 'assistant',
            variant: 'branch_perf_table',
          },
        ]);
        setBotStage('branch_perf_table');
      }, 2900);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }

    if (botStage === 'branch_perf_table') {
      setBotStage('done');
      return;
    }
  }, [botStage]);

  const handleReset = () => {
    setMessages([]);
    setBotStage('idle');
    setPrefillText('');
    setComposerPlaceholder(undefined);
    setDevSteps(buildSteps([...DEV_LOADER_STEPS]));
    setDisbursalSteps(buildSteps([...DISBURSAL_LOADER_STEPS]));
    setProductDetailsSteps(buildSteps([...PRODUCT_DETAILS_LOADER_STEPS]));
    setPendingApprovalsSteps(buildSteps([...PENDING_APPROVALS_LOADER_STEPS]));
    setBranchPerfSteps(buildSteps([...BRANCH_PERF_LOADER_STEPS]));
    setActionedCases({});
  };

  const hasMessages = messages.length > 0;

  const renderMessage = (message: Message) => {
    if (message.type === 'user') {
      return <UserMessageBubble text={message.text} />;
    }

    if (message.variant === 'summary_card') {
      return (
        <div className="flex justify-start w-full">
          <div className="max-w-[85%] flex flex-col gap-3">
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {message.text}
            </p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  My Deviations — Regional Summary (MTD)
                </p>
              </div>
              {[
                { label: 'Total cases handled', value: '1,120' },
                { label: 'Cases with deviations', value: '46' },
                { label: 'Deviation rate', value: '4.1%' },
                { label: 'Cases beyond SLA', value: '9' },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (message.variant === 'chips') {
      const chips = [
        'Show branch-wise breakdown',
        'Which cases are beyond SLA?',
        TOP_DEV_QUERY,
      ];
      return (
        <div className="flex flex-wrap gap-2 w-full" style={{ animation: 'slideUpFade 250ms ease-out' }}>
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => handleChipSelect(chip)}
              className="px-4 py-2 rounded-full text-sm transition-all duration-150 hover:opacity-80 active:scale-[0.96]"
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      );
    }

    if (message.variant === 'dev_loader') {
      return (
        <div className="w-full">
          <ProgressCard title="Checking deviation data" steps={devSteps} />
        </div>
      );
    }

    if (message.variant === 'disbursal_loader') {
      return (
        <div className="w-full">
          <ProgressCard title="Fetching disbursal data" steps={disbursalSteps} />
        </div>
      );
    }

    if (message.variant === 'disbursal_snapshot') {
      return (
        <div className="flex flex-col gap-1">
          <BotMessageText text="Total disbursal ₹68.5 Cr" />
          <BotMessageText text="Total cases disbursed 940" />
        </div>
      );
    }

    if (message.variant === 'disbursal_followups') {
      return (
        <div className="flex flex-wrap gap-2 w-full" style={{ animation: 'slideUpFade 250ms ease-out' }}>
          {DISBURSAL_FOLLOWUPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipSelect(chip)}
              className="px-4 py-2 rounded-full text-sm transition-all duration-150 hover:opacity-80 active:scale-[0.96]"
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      );
    }

    if (message.variant === 'deviation_table') {
      return (
        <div className="flex justify-start w-full">
          <div className="max-w-[90%] flex flex-col gap-3">
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {message.text}
            </p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-[480px] w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {['Deviation Type', 'Cases', '% Share', 'Ops Context'].map(h => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-medium uppercase tracking-wide"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEVIATION_TABLE_DATA.map((row, i) => (
                      <motion.tr
                        key={row.type}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: 0.05 + i * 0.07 }}
                        style={{ borderBottom: i < DEVIATION_TABLE_DATA.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                      >
                        <td className="px-4 py-3 font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{row.type}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>{row.cases}</td>
                        <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{row.share}</td>
                        <td className="px-4 py-3 leading-snug" style={{ color: 'var(--text-secondary)' }}>{row.context}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (message.variant === 'product_details_loader') {
      return (
        <div className="w-full">
          <ProgressCard title="Preparing product-wise breakdown" steps={productDetailsSteps} />
        </div>
      );
    }

    if (message.variant === 'pending_approvals_loader') {
      return (
        <div className="w-full">
          <ProgressCard title="Fetching your approval queue" steps={pendingApprovalsSteps} />
        </div>
      );
    }

    if (message.variant === 'pending_approvals_table') {
      return (
        <div className="flex justify-start w-full">
          <div className="w-full flex flex-col gap-3">
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {message.text}
            </p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
            >
              <table className="w-full table-fixed text-xs">
                <colgroup>
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '33%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '14%' }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                    {['Case ID', 'Date', 'Reason', 'Explanation', 'Link', 'Action'].map(h => (
                      <th
                        key={h}
                        className="px-2 py-2 text-left font-medium uppercase tracking-wide"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PENDING_APPROVALS_DATA.map((row, i) => (
                    <motion.tr
                      key={row.caseId}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: 0.05 + i * 0.1 }}
                      style={{ borderBottom: i < PENDING_APPROVALS_DATA.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    >
                      <td className="px-2 py-2 font-mono font-semibold break-all" style={{ color: 'var(--text-primary)' }}>
                        {row.caseId}
                      </td>
                      <td className="px-2 py-2 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                        {row.date}
                      </td>
                      <td className="px-2 py-2 font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {row.reason}
                      </td>
                      <td className="px-2 py-2 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                        {row.explanation}
                      </td>
                      <td className="px-2 py-2">
                        <a
                          href="#"
                          className="underline underline-offset-2 hover:opacity-70 transition-opacity leading-snug"
                          style={{ color: 'var(--brand-blue)' }}
                          onClick={e => e.preventDefault()}
                        >
                          {row.link}
                        </a>
                      </td>
                      <td className="px-2 py-2">
                        {actionedCases[row.caseId] ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={actionedCases[row.caseId] === 'approved'
                              ? { backgroundColor: '#16a34a20', color: '#16a34a' }
                              : { backgroundColor: '#dc262620', color: '#dc2626' }}
                          >
                            {actionedCases[row.caseId] === 'approved' ? (
                              <>
                                <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden>
                                  <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Approved
                              </>
                            ) : (
                              <>
                                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden>
                                  <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                                </svg>
                                Rejected
                              </>
                            )}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              title="Approve"
                              onClick={() => handleCaseAction(row.caseId, 'approve')}
                              className="w-6 h-6 flex items-center justify-center rounded-full transition-all hover:opacity-80 active:scale-90"
                              style={{ backgroundColor: '#16a34a20', color: '#16a34a' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                                <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              title="Reject"
                              onClick={() => handleCaseAction(row.caseId, 'reject')}
                              className="w-6 h-6 flex items-center justify-center rounded-full transition-all hover:opacity-80 active:scale-90"
                              style={{ backgroundColor: '#dc262620', color: '#dc2626' }}
                            >
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                                <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (message.variant === 'product_details_table') {
      return (
        <div className="flex justify-start w-full">
          <div className="max-w-[90%] flex flex-col gap-3">
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {message.text}
            </p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Product-wise Details
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[520px] w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {['Product', 'Applications', 'Approval %', 'Disbursal ₹ Cr'].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left font-medium uppercase tracking-wide"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DISBURSAL_PRODUCT_ROWS.map((row, index) => (
                      <motion.tr
                        key={row.product}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: 0.05 + index * 0.07 }}
                        style={{ borderBottom: index < DISBURSAL_PRODUCT_ROWS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                      >
                        <td className="px-4 py-3 font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{row.product}</td>
                        <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-primary)' }}>{row.applications}</td>
                        <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-primary)' }}>{row.approval}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>{row.disbursal}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (message.variant === 'branch_perf_loader') {
      return (
        <div className="w-full">
          <ProgressCard title="Pulling branch performance data" steps={branchPerfSteps} />
        </div>
      );
    }

    if (message.variant === 'branch_perf_table') {
      return (
        <div className="flex justify-start w-full">
          <div className="w-full flex flex-col gap-3">
            {/* Summary bubble */}
            <div
              className="rounded-xl px-4 py-3.5 flex flex-col gap-2"
              style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Here's the branch-wise deviation summary for this week.
              </p>
              <div className="flex flex-col gap-1.5 mt-0.5">
                {[
                  { label: 'Total cases reviewed', value: '~250 / week' },
                  { label: 'Total deviations',     value: '20' },
                  { label: 'Overall deviation rate', value: '8%' },
                ].map(row => (
                  <div key={row.label} className="flex items-baseline gap-2 text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div
                className="mt-1 pt-2.5 flex flex-col gap-1.5"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-start gap-2 text-sm">
                  <span className="shrink-0" style={{ color: 'var(--text-secondary)' }}>Concentration</span>
                  <span style={{ color: 'var(--text-primary)' }}>~55% of deviations from Hadapsar &amp; Viman Nagar</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="shrink-0" style={{ color: 'var(--text-secondary)' }}>Nature</span>
                  <span style={{ color: 'var(--text-primary)' }}>Predominantly policy-bound but process-led</span>
                </div>
              </div>
            </div>

            {/* Branch table */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
            >
              <table className="w-full table-fixed text-xs">
                <colgroup>
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '40%' }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                    {['Branch', 'Cases Reviewed', 'No. of Deviations', 'Deviation %', 'Top Deviation Reasons'].map(h => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left font-medium uppercase tracking-wide"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BRANCH_PERF_DATA.map((row, i) => (
                    <motion.tr
                      key={row.branch}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: 0.05 + i * 0.07 }}
                      style={{ borderBottom: i < BRANCH_PERF_DATA.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    >
                      <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {row.branch}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                        {row.cases}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums font-medium" style={{ color: 'var(--text-primary)' }}>
                        {row.deviations}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {row.pct}
                      </td>
                      <td className="px-3 py-2.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {row.reasons}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return <BotMessageText text={message.text} isLoading={message.isLoading} />;
  };

  const chatTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <>
      <AnimatePresence mode="wait">
        {hasMessages ? (
          <motion.div
            key="chat"
            className="flex flex-col h-full overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={chatTransition}
          >
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
                {messages.map(message => (
                  <div key={message.id} style={{ animation: 'slideUpFade 250ms ease-out' }}>
                    {renderMessage(message)}
                  </div>
                ))}
                <div ref={messagesEndRef} style={{ height: '4rem' }} />
              </div>
            </div>

            <div
              className="shrink-0 border-t px-4 py-4"
              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-1)' }}
            >
              <div className="max-w-2xl mx-auto">
                <ChatComposer
                  placeholder={composerPlaceholder}
                  onSendMessage={handleSendMessage}
                  onNewConversation={handleReset}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            className="flex flex-col items-center justify-center h-full px-4 py-8 gap-5 overflow-y-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={chatTransition}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <p style={{ fontSize: '32px', fontFamily: "'Lora', serif", fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Hi Amit
              </p>
              <h1 style={{ fontSize: '40px', fontFamily: "'Lora', serif", fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
                Where should we start?
              </h1>
            </div>

            <div className="w-full max-w-xl">
              <ChatComposer
                prefillValue={prefillText}
                onSendMessage={(q) => { setPrefillText(''); handleSendMessage(q); }}
              />
            </div>

            <SuggestiveActions
              categories={RCOMMS_CATEGORIES}
              onHoverPrompt={setPrefillText}
              onSelectPrompt={(q) => setPrefillText(q)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
