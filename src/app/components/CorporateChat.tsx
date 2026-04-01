import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  BarChart2, TrendingDown, FileText, BookOpen,
  ChevronRight, RefreshCw, Clock,
} from 'lucide-react';
import { MessageBubble, ProgressCard } from './sales-helpline/SalesComponents';
import type { Step } from './sales-helpline/SalesComponents';
import { ChatComposer } from './ChatComposer';
import { SuggestiveActions, type SuggestiveCategory } from './SuggestiveActions';

// ── Types ──────────────────────────────────────────────────────────────────

type ChatStage =
  | 'home'
  | 'it_loading'
  | 'it_summary'
  | 'attrition_loading'
  | 'attrition_summary'
  | 'attrition_breakdown_loading'
  | 'attrition_breakdown'
  | 'attrition_actions'
  | 'golive_loading'
  | 'golive_detail'
  | 'kid_loading'
  | 'kid_summary'
  | 'kid_red_loading'
  | 'kid_red_detail'
  | 'kid_amber_loading'
  | 'kid_amber_detail'
  | 'generic';

type MsgType =
  | 'text'
  | 'it_loader'
  | 'it_summary_card'
  | 'it_follow_chips'
  | 'attrition_loader'
  | 'attrition_summary_card'
  | 'attrition_follow_chips'
  | 'attrition_breakdown_loader'
  | 'attrition_table'
  | 'attrition_action_chips'
  | 'golive_loader'
  | 'golive_table'
  | 'golive_chips'
  | 'kid_loader'
  | 'kid_summary_card'
  | 'kid_summary_table'
  | 'kid_metric_chips'
  | 'kid_red_loader'
  | 'kid_red_table'
  | 'kid_amber_loader'
  | 'kid_amber_table';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  type: MsgType;
  content?: string;
  meta?: { chips?: string[] };
}

// ── Constants ──────────────────────────────────────────────────────────────

const TEAL = '#0e7490';

const IT_STATUS_ROWS = [
  { label: 'On Track',            count: 320, color: '#16a34a', bg: 'rgba(22,163,74,0.08)'  },
  { label: 'On Hold',             count: 10,  color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  { label: 'Dropped by Business', count: 10,  color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  { label: 'Go-Live Delayed',     count: 5,   color: '#dc2626', bg: 'rgba(220,38,38,0.08)'  },
  { label: 'Milestone Delayed',   count: 5,   color: '#dc2626', bg: 'rgba(220,38,38,0.08)'  },
];

const GOLIVE_ROWS = [
  {
    project:  'LOS Upgrade v3.2',
    planned:  '15 Apr',
    revised:  '20 May',
    delay:    '35d',
    blocker:  'UAT sign-off pending',
    owner:    'Arjun Mehta',
  },
  {
    project:  '3IN1 Middle Layer Stability Pack',
    planned:  '05 Apr',
    revised:  '28 Apr',
    delay:    '23d',
    blocker:  'Infra capacity + perf testing',
    owner:    'Priya Nair',
  },
  {
    project:  'SalesOne v6.1 Release',
    planned:  '10 Apr',
    revised:  '06 May',
    delay:    '26d',
    blocker:  'CAB window + security sign-off',
    owner:    'Rohan Desai',
  },
  {
    project:  'APIM Gateway Migration',
    planned:  '25 Mar',
    revised:  '22 Apr',
    delay:    '28d',
    blocker:  'Dependency on network change',
    owner:    'Sneha Kulkarni',
  },
  {
    project:  'KYC POD eKYC Enhancements',
    planned:  '02 Apr',
    revised:  '30 Apr',
    delay:    '28d',
    blocker:  'Vendor SDK patch',
    owner:    'Vikram Joshi',
  },
];

const KID_AREA_TABLE = [
  { area: 'Delivery',       total: 12, green: 9,  amber: 2, red: 1 },
  { area: 'Quality',        total: 10, green: 8,  amber: 2, red: 0 },
  { area: 'Operations',     total: 8,  green: 7,  amber: 1, red: 0 },
  { area: 'People',         total: 8,  green: 5,  amber: 2, red: 1 },
  { area: 'Financial',      total: 5,  green: 4,  amber: 1, red: 0 },
  { area: 'Security',       total: 5,  green: 4,  amber: 1, red: 0 },
  { area: 'TOTAL',          total: 48, green: 41, amber: 5, red: 2 },
];

const KID_RED_ROWS = [
  { metric: 'Web2App Installs',          area: 'App Acquisition', value: '3% vs 30% AOP'      },
  { metric: 'NON-POS App Downloads',     area: 'App Acquisition', value: '69% of AOP'          },
  { metric: 'Call Center App Downloads', area: 'App Acquisition', value: '60% of AOP'          },
  { metric: 'App Engagement Score',      area: 'App Heart',       value: '1.5 vs ~2.4'         },
  { metric: 'ANR',                       area: 'App Stability',   value: '4.67% vs 4% AOP'    },
  { metric: 'Cold Start Time',           area: 'App Performance', value: '22.0% vs 15% AOP'   },
];

const KID_AMBER_ROWS = [
  { metric: 'Total App Downloads',      area: 'App Acquisition',  value: '104% of AOP'          },
  { metric: 'POS (B2B) Downloads',      area: 'App Acquisition',  value: '99% of AOP'           },
  { metric: 'Paid DP Traffic',          area: 'Web Traffic',      value: '91% of AOP'           },
  { metric: 'Service Web Traffic',      area: 'Web Traffic',      value: '91% of AOP'           },
  { metric: 'Web Avg Session Time',     area: 'Web Engagement',   value: 'Below AOP'            },
  { metric: 'Bounce Rate – HP (Web)',   area: 'Adoption',         value: '47% vs 40% threshold' },
  { metric: 'App DXS',                  area: 'App Heart',        value: '5.4 vs ~6.1 L3MA'    },
  { metric: 'Loans MAU',               area: 'Engagement',       value: '65% of AOP'           },
  { metric: 'B2B MAU',                 area: 'Engagement',       value: '84% of AOP'           },
  { metric: 'Monthly App Sessions',    area: 'Engagement',       value: '80% of AOP'           },
  { metric: 'Uninstall Rate',          area: 'Adoption',         value: '38.9% vs 37.3% AOP'  },
];

const DP_KID_TRIGGER = 'Show me a summarised view of Digital KID';
const KID_LIVE_STAGES: ChatStage[] = ['kid_summary', 'kid_red_detail', 'kid_amber_detail'];

const IT_PROJECTS_TRIGGER = 'Give me a current status summary of all active IT projects';
const MY_ATTRITION_TRIGGER = "What's my attrition status";

const ATTRITION_SUMMARY = {
  annualized: '8.4%',
  mtdExits: 15,
  ytdExits: 120,
  narrative: 'Attrition is stable and controlled; no unit is in breach.',
};

const ATTRITION_ROWS = [
  { unit: 'IT', headcount: '1,420', mtdExits: '7', ytdExits: '55', annualized: '7.2%', aopTarget: '8.0%', status: 'On Target', tone: 'success' },
  { unit: 'AI', headcount: '210', mtdExits: '4', ytdExits: '25', annualized: '9.6%', aopTarget: '8.5%', status: 'Breach', tone: 'danger' },
  { unit: 'Strategy', headcount: '95', mtdExits: '1', ytdExits: '15', annualized: '6.8%', aopTarget: '7.5%', status: 'On Target', tone: 'success' },
  { unit: 'Productization', headcount: '160', mtdExits: '3', ytdExits: '25', annualized: '8.9%', aopTarget: '8.5%', status: 'Breach', tone: 'danger' },
  { unit: 'TOTAL (My Level)', headcount: '1,885', mtdExits: '15', ytdExits: '120', annualized: '8.4%', aopTarget: '8.0%', status: 'Breach', tone: 'danger' },
] as const;

const ATTRITION_ACTIONS = [
  'Show only breach units',
  'Why is AI in breach?',
  'Why is Productization in breach?',
  'What actions should I take this month?',
  'Compare this with last quarter',
] as const;

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const isITProjectsIntent = (q: string) =>
  normalize(q).includes('it project') || q === IT_PROJECTS_TRIGGER;
const isMyAttritionIntent = (q: string) => {
  const normalized = normalize(q);
  return (
    normalized === normalize(MY_ATTRITION_TRIGGER) ||
    normalized.includes('my attrition') ||
    (normalized.includes('attrition') && normalized.includes('my') && normalized.includes('status'))
  );
};
const isUnitWiseIntent = (q: string) => {
  const n = normalize(q);
  return (
    n.includes('unit wise') || n.includes('unit-wise') || n.includes('unitwise') ||
    n.includes('show unit') || n.includes('breakdown') ||
    (n.includes('unit') && n.includes('attrition')) ||
    (n.includes('unit') && n.includes('status'))
  );
};
const isGoLiveIntent = (q: string) =>
  normalize(q).includes('go live') || normalize(q).includes('golive') || normalize(q).includes('go-live delay');
const isDPKIDIntent = (q: string) =>
  normalize(q).includes('digital kid') || normalize(q).includes('dp kid') ||
  normalize(q).includes('summarised view') || q === DP_KID_TRIGGER;

// ── Suggestive categories (home screen) ───────────────────────────────────

const CORPORATE_CATEGORIES: SuggestiveCategory[] = [
  {
    id: 'project_status',
    label: 'Project Status',
    Icon: BarChart2,
    prompts: [
      { label: 'IT projects', query: IT_PROJECTS_TRIGGER },
      { label: 'DP projects', query: 'What is the current status of all Data Platform projects? Highlight any risks or delays.' },
      { label: 'AI Projects', query: 'Show me the status of all ongoing AI projects, including milestones achieved and next steps.' },
      { label: 'Go Live Delays', query: 'Which projects are delayed on their go-live dates? Summarise reasons and revised timelines.' },
      { label: 'Milestone Delays', query: 'List all projects with milestone delays this quarter. What is the impact and mitigation plan?' },
    ],
  },
  {
    id: 'attrition_status',
    label: 'Attrition Status',
    Icon: TrendingDown,
    prompts: [
      { label: 'My Attrition', query: MY_ATTRITION_TRIGGER },
      { label: 'IT Attrition', query: 'What is the attrition rate in IT? Show month-wise data and identify high-risk roles.' },
      { label: 'DP Attrition', query: 'Show attrition numbers for the Data Platform team. Which roles or levels are most affected?' },
      { label: 'AI Attrition', query: 'What is the attrition status for the AI unit? Highlight critical exits and replacement status.' },
      { label: 'YoY Attrition', query: 'Give me a year-on-year attrition comparison across all my teams. What are the key trends?' },
    ],
  },
  {
    id: 'minutes',
    label: 'Minutes',
    Icon: FileText,
    prompts: [
      { label: 'EMC Minutes', query: 'Show me the latest EMC meeting minutes. What were the key decisions and action items?' },
      { label: 'IT Project Review Minutes', query: 'What were the key outcomes of the last IT Project Review meeting? List action items and owners.' },
      { label: 'DP Project Review Minutes', query: 'Summarise the minutes from the last Data Platform project review. What needs follow-up?' },
      { label: 'Zero Trust Review', query: 'What were the highlights and next steps from the last Zero Trust security review meeting?' },
    ],
  },
  {
    id: 'kid_related',
    label: 'KID Related',
    Icon: BookOpen,
    prompts: [
      { label: 'DP KID', query: DP_KID_TRIGGER },
      { label: 'IT KID', query: 'What is the current status of the IT KID? Are there any items flagged as at-risk?' },
      { label: 'Compliance KID', query: 'Summarise the Compliance KID. Are all compliance indicators within acceptable thresholds?' },
      { label: 'Outsourcing Update', query: 'What is the latest outsourcing update? Show vendor performance and any escalations pending.' },
      { label: 'Productization KID', query: 'Give me an update on the Productization KID. What milestones are on track or delayed?' },
    ],
  },
];

// ── Main component ─────────────────────────────────────────────────────────

export function CorporateChat() {
  const [stage, setStage]         = useState<ChatStage>('home');
  const [msgs, setMsgs]           = useState<Msg[]>([]);
  const [itSteps, setItSteps]     = useState<Step[]>([]);
  const [attritionSteps, setAttritionSteps] = useState<Step[]>([]);
  const [attritionBreakdownSteps, setAttritionBreakdownSteps] = useState<Step[]>([]);
  const [glSteps, setGlSteps]         = useState<Step[]>([]);
  const [kidSteps, setKidSteps]       = useState<Step[]>([]);
  const [kidRedSteps, setKidRedSteps] = useState<Step[]>([]);
  const [kidAmberSteps, setKidAmberSteps] = useState<Step[]>([]);
  const [prefillText, setPrefillText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [msgs]);

  const push = (role: Msg['role'], type: MsgType, content = '', meta?: Msg['meta']) => {
    setMsgs(p => [...p, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role, type, content, meta,
    }]);
  };

  // ── IT Projects journey ────────────────────────────────────────────────

  const startITJourney = (query: string) => {
    push('user', 'text', query);
    setStage('it_loading');

    const init: Step[] = [
      { id: '1', label: 'Fetching IT project portfolio', status: 'running' },
      { id: '2', label: 'Aggregating status data',       status: 'pending' },
    ];
    setItSteps(init);
    push('assistant', 'it_loader');

    setTimeout(() => setItSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : 'running') as Step['status'],
    }))), 900);
    setTimeout(() => {
      setItSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 1800);
    setTimeout(() => {
      push('assistant', 'text', 'Here\'s a snapshot of your IT project portfolio as of today.');
      push('assistant', 'it_summary_card');
      push('assistant', 'it_follow_chips');
      setStage('it_summary');
    }, 2300);
  };

  const handleITFollowChip = (choice: string) => {
    if (stage !== 'it_summary') return;
    push('user', 'text', choice);
    if (isGoLiveIntent(choice)) {
      startGoLiveJourney();
    } else {
      setTimeout(() => {
        push('assistant', 'text', "I'll pull that up for you. This view is coming soon.");
        setStage('generic');
      }, 350);
    }
  };

  // ── Attrition journey ────────────────────────────────────────────────

  const startAttritionJourney = (query: string) => {
    push('user', 'text', query);
    setStage('attrition_loading');

    const init: Step[] = [
      { id: '1', label: 'Fetching attrition metrics', status: 'running' },
      { id: '2', label: 'Calculating annualized attrition', status: 'pending' },
      { id: '3', label: 'Preparing manager summary', status: 'pending' },
    ];
    setAttritionSteps(init);
    push('assistant', 'attrition_loader');

    setTimeout(() => setAttritionSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : i === 1 ? 'running' : 'pending') as Step['status'],
    }))), 800);
    setTimeout(() => setAttritionSteps(p => p.map((s, i) => ({
      ...s, status: (i <= 1 ? 'completed' : 'running') as Step['status'],
    }))), 1600);
    setTimeout(() => {
      setAttritionSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 2200);
    setTimeout(() => {
      push('assistant', 'text', "Here's your attrition snapshot at your level.");
      push('assistant', 'attrition_summary_card');
      setStage('attrition_summary');
    }, 2600);
  };

  const startAttritionBreakdownJourney = () => {
    setStage('attrition_breakdown_loading');

    const init: Step[] = [
      { id: '1', label: 'Preparing unit-wise attrition view', status: 'running' },
      { id: '2', label: 'Benchmarking against AOP target', status: 'pending' },
    ];
    setAttritionBreakdownSteps(init);
    push('assistant', 'attrition_breakdown_loader');

    setTimeout(() => setAttritionBreakdownSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : 'running') as Step['status'],
    }))), 850);
    setTimeout(() => {
      setAttritionBreakdownSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 1700);
    setTimeout(() => {
      push('assistant', 'text', "Here's the unit wise attrition view at your level.");
      push('assistant', 'attrition_table');
      push('assistant', 'attrition_action_chips');
      setStage('attrition_breakdown');
    }, 2100);
  };

  const handleAttritionChoice = (choice: 'Yes' | 'No') => {
    if (stage !== 'attrition_summary') return;
    push('user', 'text', choice);

    if (choice === 'Yes') {
      startAttritionBreakdownJourney();
      return;
    }

    setTimeout(() => {
      push('assistant', 'text', "Okay. I'll keep it at the summary level.");
      push('assistant', 'attrition_action_chips');
      setStage('attrition_actions');
    }, 350);
  };

  const handleAttritionAction = (choice: string) => {
    if (stage !== 'attrition_breakdown' && stage !== 'attrition_actions') return;
    push('user', 'text', choice);
    setTimeout(() => {
      push('assistant', 'text', "I'll pull that up for you. This view is coming soon.");
      setStage('generic');
    }, 350);
  };

  // ── Go-live delay journey ──────────────────────────────────────────────

  const startGoLiveJourney = () => {
    setStage('golive_loading');

    const init: Step[] = [
      { id: '1', label: 'Fetching delayed project list',   status: 'running' },
      { id: '2', label: 'Calculating revised timelines',   status: 'pending' },
    ];
    setGlSteps(init);
    push('assistant', 'golive_loader');

    setTimeout(() => setGlSteps(p => p.map((s, i) => ({
      ...s, status: (i === 0 ? 'completed' : 'running') as Step['status'],
    }))), 900);
    setTimeout(() => {
      setGlSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] })));
    }, 1700);
    setTimeout(() => {
      push('assistant', 'text', '5 projects are currently past their go-live date. Here\'s the breakdown:');
      push('assistant', 'golive_table');
      push('assistant', 'golive_chips');
      setStage('golive_detail');
    }, 2200);
  };

  const handleGoLiveChip = (choice: string) => {
    if (stage !== 'golive_detail') return;
    push('user', 'text', choice);
    setTimeout(() => {
      push('assistant', 'text', "I'll work on that. This feature is coming soon.");
      setStage('generic');
    }, 350);
  };

  // ── Digital KID journey ────────────────────────────────────────────────

  const startKIDJourney = (query: string) => {
    push('user', 'text', query);
    setStage('kid_loading');
    const init: Step[] = [
      { id: '1', label: 'Fetching Digital KID data',    status: 'running' },
      { id: '2', label: 'Preparing executive summary',  status: 'pending' },
    ];
    setKidSteps(init);
    push('assistant', 'kid_loader');
    setTimeout(() => setKidSteps(p => p.map((s, i) => ({ ...s, status: (i === 0 ? 'completed' : 'running') as Step['status'] }))), 900);
    setTimeout(() => setKidSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] }))), 1800);
    setTimeout(() => {
      push('assistant', 'text', "Here's a summarised view of your Digital KID as of today.");
      push('assistant', 'kid_summary_card');
      push('assistant', 'kid_summary_table');
      push('assistant', 'kid_metric_chips', '', { chips: ['🔴 Red items (6)', '🟡 Amber items (11)', '🟢 Green items (31)'] });
      setStage('kid_summary');
    }, 2300);
  };

  const handleKIDMetricChip = (choice: string, remainingChips: string[]) => {
    if (!KID_LIVE_STAGES.includes(stage)) return;
    push('user', 'text', choice);

    if (choice.includes('Red')) {
      setStage('kid_red_loading');
      const init: Step[] = [
        { id: '1', label: 'Fetching red indicators',  status: 'running' },
        { id: '2', label: 'Preparing detail view',    status: 'pending' },
      ];
      setKidRedSteps(init);
      push('assistant', 'kid_red_loader');
      setTimeout(() => setKidRedSteps(p => p.map((s, i) => ({ ...s, status: (i === 0 ? 'completed' : 'running') as Step['status'] }))), 900);
      setTimeout(() => setKidRedSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] }))), 1700);
      setTimeout(() => {
        push('assistant', 'text', `Here are the ${KID_RED_ROWS.length} indicators currently in the Red zone:`);
        push('assistant', 'kid_red_table');
        const next = remainingChips.filter(c => !c.includes('Red'));
        if (next.length > 0) push('assistant', 'kid_metric_chips', '', { chips: next });
        setStage('kid_red_detail');
      }, 2200);
      return;
    }

    if (choice.includes('Amber')) {
      setStage('kid_amber_loading');
      const init: Step[] = [
        { id: '1', label: 'Fetching amber indicators', status: 'running' },
        { id: '2', label: 'Preparing detail view',     status: 'pending' },
      ];
      setKidAmberSteps(init);
      push('assistant', 'kid_amber_loader');
      setTimeout(() => setKidAmberSteps(p => p.map((s, i) => ({ ...s, status: (i === 0 ? 'completed' : 'running') as Step['status'] }))), 900);
      setTimeout(() => setKidAmberSteps(p => p.map(s => ({ ...s, status: 'completed' as Step['status'] }))), 1700);
      setTimeout(() => {
        push('assistant', 'text', `Here are the ${KID_AMBER_ROWS.length} indicators currently in the Amber zone:`);
        push('assistant', 'kid_amber_table');
        const next = remainingChips.filter(c => !c.includes('Amber'));
        if (next.length > 0) push('assistant', 'kid_metric_chips', '', { chips: next });
        setStage('kid_amber_detail');
      }, 2200);
      return;
    }

    // Green
    setTimeout(() => {
      push('assistant', 'text', 'All 41 green indicators are performing within or above target. Detailed green view is coming soon.');
      setStage('generic');
    }, 350);
  };

  // ── Reset ──────────────────────────────────────────────────────────────

  const handleReset = () => {
    setMsgs([]);
    setItSteps([]);
    setAttritionSteps([]);
    setAttritionBreakdownSteps([]);
    setGlSteps([]);
    setKidSteps([]);
    setKidRedSteps([]);
    setKidAmberSteps([]);
    setStage('home');
  };

  // ── Query dispatcher ───────────────────────────────────────────────────

  const handleSend = (query: string) => {
    if (!query.trim()) return;
    if (stage === 'home') {
      setPrefillText('');
      if (isMyAttritionIntent(query)) {
        startAttritionJourney(query);
        return;
      }
      if (isITProjectsIntent(query)) {
        startITJourney(query);
        return;
      }
      if (isDPKIDIntent(query)) {
        startKIDJourney(query);
        return;
      }
      push('user', 'text', query);
      setTimeout(() => {
        push('assistant', 'text', "I'll look into that for you. This view is coming soon.");
        setStage('generic');
      }, 400);
      return;
    }
    if (stage === 'it_summary' && isGoLiveIntent(query)) {
      push('user', 'text', query);
      startGoLiveJourney();
      return;
    }
    if (stage === 'attrition_summary') {
      if (isUnitWiseIntent(query)) {
        push('user', 'text', query);
        startAttritionBreakdownJourney();
        return;
      }
      push('user', 'text', query);
      setTimeout(() => {
        push('assistant', 'text', "I'll look into that for you. This view is coming soon.");
      }, 400);
      return;
    }
    if (stage === 'attrition_breakdown' || stage === 'attrition_actions') {
      handleAttritionAction(query);
      return;
    }
    if (stage === 'generic') {
      if (isMyAttritionIntent(query)) {
        startAttritionJourney(query);
        return;
      }
      if (isITProjectsIntent(query)) {
        startITJourney(query);
        return;
      }
      if (isDPKIDIntent(query)) {
        startKIDJourney(query);
        return;
      }
      push('user', 'text', query);
      setTimeout(() => {
        push('assistant', 'text', "I'll look into that for you. This view is coming soon.");
      }, 400);
    }
  };

  // ── Derived helpers ────────────────────────────────────────────────────

  const lastItFollowId  = msgs.filter(m => m.type === 'it_follow_chips').at(-1)?.id;
  const lastAttritionLoaderId = msgs.filter(m => m.type === 'attrition_loader').at(-1)?.id;
  const lastAttritionFollowId = msgs.filter(m => m.type === 'attrition_follow_chips').at(-1)?.id;
  const lastAttritionBreakdownLoaderId = msgs.filter(m => m.type === 'attrition_breakdown_loader').at(-1)?.id;
  const lastAttritionActionId = msgs.filter(m => m.type === 'attrition_action_chips').at(-1)?.id;
  const lastGlChipsId       = msgs.filter(m => m.type === 'golive_chips').at(-1)?.id;
  const lastItLoaderId      = msgs.filter(m => m.type === 'it_loader').at(-1)?.id;
  const lastGlLoaderId      = msgs.filter(m => m.type === 'golive_loader').at(-1)?.id;
  const lastKidLoaderId     = msgs.filter(m => m.type === 'kid_loader').at(-1)?.id;
  const lastKidRedLoaderId  = msgs.filter(m => m.type === 'kid_red_loader').at(-1)?.id;
  const lastKidAmberLoaderId = msgs.filter(m => m.type === 'kid_amber_loader').at(-1)?.id;
  const lastKidChipsId      = msgs.filter(m => m.type === 'kid_metric_chips').at(-1)?.id;

  // ── Home screen ────────────────────────────────────────────────────────

  if (stage === 'home') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-8 gap-5 overflow-y-auto">
        <div className="flex flex-col items-center gap-2 text-center">
          <p style={{ fontSize: '32px', fontFamily: "'Lora', serif", fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.2 }}>Hi Anurag</p>
          <h1
            style={{ fontSize: '40px', fontFamily: "'Lora', serif", fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.15 }}
          >
            Where should we start?
          </h1>
        </div>

        <div className="w-full max-w-xl">
          <ChatComposer
            placeholder="Ask about projects, attrition, minutes or KIDs…"
            prefillValue={prefillText}
            onSendMessage={handleSend}
          />
        </div>

        <SuggestiveActions
          categories={CORPORATE_CATEGORIES}
          onHoverPrompt={setPrefillText}
          onSelectPrompt={(q) => { setPrefillText(''); handleSend(q); }}
        />
      </div>
    );
  }

  // ── Chat screen ────────────────────────────────────────────────────────

  const composerPlaceholder =
    stage === 'it_summary'        ? 'Ask a follow-up or choose an option above' :
    stage === 'attrition_summary' ? 'Ask a follow-up or choose an option above' :
    stage === 'attrition_breakdown' ? 'Ask a follow-up or choose an option above' :
    stage === 'attrition_actions' ? 'Ask a follow-up or choose an option above' :
    stage === 'golive_detail'     ? 'Ask a follow-up or choose an option above' :
    stage === 'kid_summary'       ? 'Ask a follow-up or choose an option above' :
    stage === 'kid_red_detail'    ? 'Ask a follow-up or choose an option above' :
    stage === 'kid_amber_detail'  ? 'Ask a follow-up or choose an option above' :
    stage === 'generic'           ? 'What would you like to know next?' :
    'Processing…';

  const composerDisabled =
    stage !== 'it_summary' &&
    stage !== 'attrition_summary' &&
    stage !== 'attrition_breakdown' &&
    stage !== 'attrition_actions' &&
    stage !== 'golive_detail' &&
    stage !== 'kid_summary' &&
    stage !== 'kid_red_detail' &&
    stage !== 'kid_amber_detail' &&
    stage !== 'generic';

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col">

          {msgs.map(m => {

            // ── text ─────────────────────────────────────────────────
            if (m.type === 'text') {
              return (
                <MessageBubble key={m.id} role={m.role} content={m.content ?? ''} />
              );
            }

            // ── IT loader ─────────────────────────────────────────────
            if (m.type === 'it_loader') {
              const steps = m.id === lastItLoaderId ? itSteps : itSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Fetching IT project data" steps={steps} />
                </div>
              );
            }

            // ── IT summary card ───────────────────────────────────────
            if (m.type === 'it_summary_card') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    {/* Header */}
                    <div className="px-5 pt-5 pb-4"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-end gap-3">
                        <span
                          className="text-5xl font-bold leading-none tabular-nums"
                          style={{ color: TEAL }}
                        >
                          350
                        </span>
                        <div className="pb-1">
                          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            IT Projects
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Active portfolio
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status rows */}
                    <div className="px-5 py-3 space-y-2.5">
                      {IT_STATUS_ROWS.map((row, i) => (
                        <motion.div
                          key={row.label}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 + i * 0.07 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: row.color }}
                            />
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {row.label}
                            </span>
                          </div>
                          <span
                            className="text-sm font-semibold tabular-nums px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: row.bg, color: row.color }}
                          >
                            {row.count}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 flex items-center gap-1.5"
                      style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <Clock size={11} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        Last synced: Today, 9:15 AM
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── Attrition loader ─────────────────────────────────────
            if (m.type === 'attrition_loader') {
              const steps = m.id === lastAttritionLoaderId
                ? attritionSteps
                : attritionSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Fetching attrition data" steps={steps} />
                </div>
              );
            }

            // ── Attrition summary card ───────────────────────────────
            if (m.type === 'attrition_summary_card') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    <div className="px-5 pt-5 pb-4"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-end gap-3">
                        <span
                          className="text-5xl font-bold leading-none tabular-nums"
                          style={{ color: TEAL }}
                        >
                          {ATTRITION_SUMMARY.annualized}
                        </span>
                        <div className="pb-1">
                          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Annualized Attrition
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            My level snapshot
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-4 space-y-3">
                      {[
                        { label: 'MTD Exits', value: ATTRITION_SUMMARY.mtdExits, tone: '#d97706', bg: 'rgba(217,119,6,0.08)' },
                        { label: 'YTD Exits', value: ATTRITION_SUMMARY.ytdExits, tone: TEAL, bg: 'rgba(14,116,144,0.08)' },
                      ].map((row, i) => (
                        <motion.div
                          key={row.label}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.08 + i * 0.08 }}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{row.label}</span>
                          <span
                            className="text-sm font-semibold tabular-nums px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: row.bg, color: row.tone }}
                          >
                            {row.value}
                          </span>
                        </motion.div>
                      ))}

                      <div
                        className="rounded-xl px-3.5 py-3 text-sm"
                        style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)' }}
                      >
                        {ATTRITION_SUMMARY.narrative}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── Attrition yes/no chips ───────────────────────────────
            if (m.type === 'attrition_follow_chips') {
              const isLive = stage === 'attrition_summary' && m.id === lastAttritionFollowId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.08 }}
                  className="w-full mb-4">
                  <div className="mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                    Would you like to see a unit wise breakdown attrition at your level?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['Yes', 'No'] as const).map(choice => (
                      <button
                        key={choice}
                        onClick={() => isLive && handleAttritionChoice(choice)}
                        disabled={!isLive}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                        style={{
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          opacity: isLive ? 1 : 0.45,
                          cursor: isLive ? 'pointer' : 'default',
                        }}>
                        {choice}
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            }

            // ── Attrition breakdown loader ───────────────────────────
            if (m.type === 'attrition_breakdown_loader') {
              const steps = m.id === lastAttritionBreakdownLoaderId
                ? attritionBreakdownSteps
                : attritionBreakdownSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Preparing attrition breakdown" steps={steps} />
                </div>
              );
            }

            // ── Attrition table ──────────────────────────────────────
            if (m.type === 'attrition_table') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    <div className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Attrition at My Level
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
                        3 Breach
                      </span>
                    </div>

                    <div className="overflow-x-auto md:overflow-visible">
                      <table className="w-full table-fixed text-xs">
                        <colgroup>
                          <col className="w-[20%]" />
                          <col className="w-[11%]" />
                          <col className="w-[9%]" />
                          <col className="w-[9%]" />
                          <col className="w-[16%]" />
                          <col className="w-[12%]" />
                          <col className="w-[23%]" />
                        </colgroup>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            {['Unit', 'Head Count', 'MTD Exit', 'YTD Exit', 'Annual Attrition', 'AOP Target', 'Status'].map(header => (
                              <th
                                key={header}
                                className="px-2.5 py-2 text-left font-medium uppercase tracking-wide leading-snug whitespace-normal break-words"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ATTRITION_ROWS.map((row, i) => {
                            const isDanger = row.tone === 'danger';
                            const badgeBg = isDanger ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)';
                            const badgeColor = isDanger ? '#dc2626' : '#16a34a';
                            const statusText = isDanger ? '🔴 Breach' : '✅ On Target';
                            return (
                              <motion.tr
                                key={row.unit}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: 0.06 + i * 0.07 }}
                                style={{
                                  borderBottom: i < ATTRITION_ROWS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                  backgroundColor: row.unit.startsWith('TOTAL') ? 'var(--surface-2)' : 'transparent',
                                }}
                              >
                                <td className="px-2.5 py-2 font-medium leading-snug break-words" style={{ color: 'var(--text-primary)', fontWeight: row.unit.startsWith('TOTAL') ? 600 : 500 }}>{row.unit}</td>
                                <td className="px-2.5 py-2 tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: row.unit.startsWith('TOTAL') ? 600 : 400 }}>{row.headcount}</td>
                                <td className="px-2.5 py-2 tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: row.unit.startsWith('TOTAL') ? 600 : 400 }}>{row.mtdExits}</td>
                                <td className="px-2.5 py-2 tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: row.unit.startsWith('TOTAL') ? 600 : 400 }}>{row.ytdExits}</td>
                                <td className="px-2.5 py-2 tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: row.unit.startsWith('TOTAL') ? 600 : 400 }}>{row.annualized}</td>
                                <td className="px-2.5 py-2 tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: row.unit.startsWith('TOTAL') ? 600 : 400 }}>{row.aopTarget}</td>
                                <td className="px-2.5 py-2">
                                  <span
                                    className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap"
                                    style={{ backgroundColor: badgeBg, color: badgeColor }}
                                  >
                                    {statusText}
                                  </span>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── Attrition follow-up actions ──────────────────────────
            if (m.type === 'attrition_action_chips') {
              const isLive = (stage === 'attrition_breakdown' || stage === 'attrition_actions') && m.id === lastAttritionActionId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.08 }}
                  className="flex flex-wrap gap-2 mb-4">
                  {ATTRITION_ACTIONS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => isLive && handleAttritionAction(chip)}
                      disabled={!isLive}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        opacity: isLive ? 1 : 0.45,
                        cursor: isLive ? 'pointer' : 'default',
                      }}>
                      {chip}
                      <ChevronRight size={13} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  ))}
                </motion.div>
              );
            }

            // ── IT follow-up chips ────────────────────────────────────
            if (m.type === 'it_follow_chips') {
              const isLive = stage === 'it_summary' && m.id === lastItFollowId;
              const chips = [
                'Show me go-live delays',
                'Show milestone delays',
                'Export report',
              ];
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.08 }}
                  className="flex flex-wrap gap-2 mb-4">
                  {chips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => isLive && handleITFollowChip(chip)}
                      disabled={!isLive}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        opacity: isLive ? 1 : 0.45,
                        cursor: isLive ? 'pointer' : 'default',
                      }}>
                      {chip}
                      <ChevronRight size={13} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  ))}
                </motion.div>
              );
            }

            // ── Go-live loader ────────────────────────────────────────
            if (m.type === 'golive_loader') {
              const steps = m.id === lastGlLoaderId ? glSteps : glSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Fetching delay data" steps={steps} />
                </div>
              );
            }

            // ── Go-live delay table ───────────────────────────────────
            if (m.type === 'golive_table') {
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>

                    {/* Table header bar */}
                    <div className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Top Delayed Projects
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
                        5 Delayed
                      </span>
                    </div>

                    {/* Column headings */}
                    <div className="grid grid-cols-[1.5fr_auto_auto_auto_1.5fr_1.2fr] gap-x-3 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide"
                      style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span>Project</span>
                      <span>Planned</span>
                      <span>Revised</span>
                      <span>Delay</span>
                      <span>Blocker</span>
                      <span>Owner</span>
                    </div>

                    {/* Rows */}
                    {GOLIVE_ROWS.map((row, i) => (
                      <motion.div
                        key={row.project}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.06 + i * 0.08 }}
                        className="grid grid-cols-[1.5fr_auto_auto_auto_1.5fr_1.2fr] gap-x-3 items-start px-5 py-3.5 text-xs"
                        style={{ borderBottom: i < GOLIVE_ROWS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                      >
                        <span className="font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                          {row.project}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{row.planned}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{row.revised}</span>
                        <span className="font-semibold tabular-nums" style={{ color: '#dc2626' }}>
                          +{row.delay}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md leading-snug text-[11px]"
                          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                          {row.blocker}
                        </span>
                        <span className="font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                          {row.owner}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            }

            // ── Go-live follow-up chips ───────────────────────────────
            if (m.type === 'golive_chips') {
              const isLive = stage === 'golive_detail' && m.id === lastGlChipsId;
              const chips = [
                'Dive deeper in delayed projects',
                'Show milestone delays',
              ];
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.08 }}
                  className="flex flex-wrap gap-2 mb-4">
                  {chips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => isLive && handleGoLiveChip(chip)}
                      disabled={!isLive}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        opacity: isLive ? 1 : 0.45,
                        cursor: isLive ? 'pointer' : 'default',
                      }}>
                      {chip}
                      <ChevronRight size={13} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  ))}
                </motion.div>
              );
            }

            // ── KID loader ────────────────────────────────────────────
            if (m.type === 'kid_loader') {
              const steps = m.id === lastKidLoaderId ? kidSteps : kidSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Fetching Digital KID" steps={steps} />
                </div>
              );
            }

            // ── KID summary card ──────────────────────────────────────
            if (m.type === 'kid_summary_card') {
              const G = '#16a34a'; const A = '#d97706'; const R = '#dc2626';
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-3">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-end gap-3">
                        <span className="text-5xl font-bold leading-none tabular-nums" style={{ color: TEAL }}>48</span>
                        <div className="pb-1">
                          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Digital KID Metrics</div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Executive summary · FY26 Q1</div>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-4 flex gap-4">
                      {[
                        { label: 'Green', count: 31, color: G, bg: 'rgba(22,163,74,0.08)' },
                        { label: 'Amber', count: 11, color: A, bg: 'rgba(217,119,6,0.08)' },
                        { label: 'Red',   count: 6,  color: R, bg: 'rgba(220,38,38,0.08)' },
                      ].map((item, i) => (
                        <motion.div key={item.label}
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.08 + i * 0.08 }}
                          className="flex-1 rounded-xl px-3 py-3 text-center"
                          style={{ backgroundColor: item.bg }}>
                          <div className="text-2xl font-bold tabular-nums" style={{ color: item.color }}>{item.count}</div>
                          <div className="text-xs mt-0.5" style={{ color: item.color }}>{item.label}</div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="px-5 py-3 flex items-center gap-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <Clock size={11} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Last updated: Today, 8:00 AM</span>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── KID area breakdown table ──────────────────────────────
            if (m.type === 'kid_summary_table') {
              const G = '#16a34a'; const A = '#d97706'; const R = '#dc2626';
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.08 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center px-5 py-3.5"
                      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Area Breakdown</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-[480px] w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            {['Area', 'Total', 'Green', 'Amber', 'Red'].map(h => (
                              <th key={h} className="px-4 py-2.5 text-left font-medium uppercase tracking-wide"
                                style={{ color: 'var(--text-secondary)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {KID_AREA_TABLE.map((row, i) => (
                            <motion.tr key={row.area}
                              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18, delay: 0.06 + i * 0.06 }}
                              style={{
                                borderBottom: i < KID_AREA_TABLE.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                backgroundColor: row.area === 'TOTAL' ? 'var(--surface-2)' : 'transparent',
                              }}>
                              <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>{row.area}</td>
                              <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>{row.total}</td>
                              <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: G }}>{row.green}</td>
                              <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: A }}>{row.amber}</td>
                              <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: row.red > 0 ? R : 'var(--text-secondary)' }}>{row.red}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── KID metric chips ──────────────────────────────────────
            if (m.type === 'kid_metric_chips') {
              const chips = m.meta?.chips ?? [];
              const isLive = KID_LIVE_STAGES.includes(stage) && m.id === lastKidChipsId;
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="flex flex-wrap gap-2 mb-4">
                  {chips.map(chip => (
                    <button key={chip}
                      onClick={() => isLive && handleKIDMetricChip(chip, chips)}
                      disabled={!isLive}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        opacity: isLive ? 1 : 0.45,
                        cursor: isLive ? 'pointer' : 'default',
                      }}>
                      {chip}
                      <ChevronRight size={13} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  ))}
                </motion.div>
              );
            }

            // ── KID red loader ────────────────────────────────────────
            if (m.type === 'kid_red_loader') {
              const steps = m.id === lastKidRedLoaderId ? kidRedSteps : kidRedSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Fetching red indicators" steps={steps} />
                </div>
              );
            }

            // ── KID red detail table ──────────────────────────────────
            if (m.type === 'kid_red_table') {
              const R = '#dc2626';
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Red Indicators</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: R }}>
                        {KID_RED_ROWS.length} items
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            {['Metric', 'Area', "Mar'25 Actual vs AOP"].map(h => (
                              <th key={h} className="px-4 py-2.5 text-left font-medium uppercase tracking-wide"
                                style={{ color: 'var(--text-secondary)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {KID_RED_ROWS.map((row, i) => (
                            <motion.tr key={row.metric}
                              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18, delay: 0.05 + i * 0.07 }}
                              style={{ borderBottom: i < KID_RED_ROWS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                              <td className="px-4 py-2.5 font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{row.metric}</td>
                              <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>{row.area}</td>
                              <td className="px-4 py-2.5 font-semibold" style={{ color: R }}>{row.value}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ── KID amber loader ──────────────────────────────────────
            if (m.type === 'kid_amber_loader') {
              const steps = m.id === lastKidAmberLoaderId ? kidAmberSteps : kidAmberSteps.map(s => ({ ...s, status: 'completed' as Step['status'] }));
              return (
                <div key={m.id} className="w-full mb-2">
                  <ProgressCard title="Fetching amber indicators" steps={steps} />
                </div>
              );
            }

            // ── KID amber detail table ────────────────────────────────
            if (m.type === 'kid_amber_table') {
              const A = '#d97706';
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mb-4">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Amber Indicators</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: A }}>
                        {KID_AMBER_ROWS.length} items
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            {['Metric', 'Area', "Mar'25 Status"].map(h => (
                              <th key={h} className="px-4 py-2.5 text-left font-medium uppercase tracking-wide"
                                style={{ color: 'var(--text-secondary)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {KID_AMBER_ROWS.map((row, i) => (
                            <motion.tr key={row.metric}
                              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18, delay: 0.05 + i * 0.06 }}
                              style={{ borderBottom: i < KID_AMBER_ROWS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                              <td className="px-4 py-2.5 font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{row.metric}</td>
                              <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>{row.area}</td>
                              <td className="px-4 py-2.5 font-semibold" style={{ color: A }}>{row.value}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return null;
          })}

          {/* Reset */}
          {(stage === 'golive_detail' || stage === 'attrition_breakdown' || stage === 'attrition_actions' || stage === 'kid_red_detail' || stage === 'kid_amber_detail' || stage === 'generic') && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center mt-2 mb-4">
              <button
                onClick={handleReset}
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
            placeholder={composerPlaceholder}
            disabled={composerDisabled}
            onSendMessage={handleSend}
            onNewConversation={handleReset}
          />
        </div>
      </div>
    </div>
  );
}
