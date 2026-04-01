import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
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
    | 'product_details_table';
}

type BotStage =
  | 'idle'
  | 'dev_l1' | 'dev_progress' | 'dev_l3' | 'dev_chips'
  | 'topdev_l1' | 'topdev_l2' | 'topdev_table'
  | 'disbursal_loading'
  | 'disbursal_followups'
  | 'product_details_loading'
  | 'product_details_table'
  | 'done';

const DEV_SUMMARY_QUERY = 'Show me a summary of all credit deviations raised under my region this month';
const TOP_DEV_QUERY = 'What are the top deviations';
const PRODUCT_WISE_DISBURSAL_QUERY = 'Give me a product-wise breakdown of disbursals this month — personal loans, business loans, CD, and others';
const PRODUCT_WISE_DETAILS_QUERY = 'Show product-wise details';
const HIGHEST_APPROVAL_QUERY = 'Which product has the highest approval rate?';
const BUSINESS_LOAN_TAT_QUERY = 'Why are Business Loans slower on TAT?';

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

const RCOMMS_CATEGORIES: SuggestiveCategory[] = [
  {
    id: 'deviations',
    label: 'My Deviations',
    Icon: ShieldCheck,
    prompts: [
      {
        label: 'My Deviation Summary',
        query: DEV_SUMMARY_QUERY,
      },
      {
        label: 'Deviation reasons',
        query: 'What are the top reasons for credit deviations in my region? Break it down by category',
      },
      {
        label: 'Region-wise deviations',
        query: 'Give me a region-wise breakdown of credit deviations for the current month',
      },
      {
        label: 'Branch-wise deviations',
        query: 'Show me branch-wise deviation data — which branches have the highest deviation count this month?',
      },
      {
        label: 'Pending approvals',
        query: 'How many credit deviations are currently pending my approval? Show me the oldest ones first',
      },
    ],
  },
  {
    id: 'disbursal',
    label: 'Disbursal Summary',
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
        label: 'Check my leave balance',
        query: 'What is my current leave balance? Show me earned, sick and casual leave days available.',
      },
      {
        label: 'Apply for a leave',
        query: 'I want to apply for leave. Can you help me check my balance and submit the request?',
      },
      {
        label: 'My claims',
        query: 'Show me all my active and recently submitted expense claims and their current status',
      },
      {
        label: 'Check my incentives',
        query: 'Show me a breakdown of my earned incentives for this quarter',
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
    } else {
      setBotStage('dev_l1');
    }
  };

  const handleChipSelect = (chip: string) => {
    handleSendMessage(chip);
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
  }, [botStage]);

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

    return <BotMessageText text={message.text} isLoading={message.isLoading} />;
  };

  return (
    <>
      {hasMessages ? (
        <div className="flex flex-col h-full overflow-hidden">
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
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full px-4 py-8 gap-5 overflow-y-auto">
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
        </div>
      )}

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
