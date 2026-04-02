import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageBubble,
  ProgressCard,
  DiagnosisOption,
  Step,
  Option
} from './SalesComponents';
import { ChatComposer } from '../ChatComposer';
import { SuggestiveActions, type SuggestiveCategory } from '../SuggestiveActions';
import { RoleBadge } from '../RoleBadge';
import {
  FileText,
  Calendar,
  BarChart2,
  ArrowRight,
  CheckCircle2,
  Store,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

// ── DMS suggestive categories ──────────────────────────────────────────────

const DMS_CATEGORIES: SuggestiveCategory[] = [
  {
    id: 'collections',
    label: 'Collections',
    Icon: FileText,
    prompts: [
      { label: "What's in my bucket today?", query: "Can you show me all accounts in my collection bucket for today, sorted by priority?" },
      { label: 'Follow-ups due today', query: "Which customers have follow-ups scheduled for today? Show me names, contact details and outstanding amounts." },
      { label: 'Check my PTP tracker', query: "Show me my Promise to Pay tracker — which customers have kept or broken their PTP commitments this week?" },
      { label: 'Open cases for resolution', query: "List all my open cases that need resolution. Which ones are most overdue?" },
      { label: 'Daily collection summary', query: "Give me a summary of today's collection activity — how much was collected versus the target?" },
    ],
  },
  {
    id: 'dealers',
    label: 'Dealers',
    Icon: Store,
    prompts: [
      { label: 'Dealer payment status', query: "What is the current payment status for my assigned dealers? Show any pending or overdue payments." },
      { label: 'View dealer account details', query: "Can you pull up the account details for a specific dealer, including recent transactions and credit limit?" },
      { label: 'Check daily transfer limit', query: "What is the current daily transfer limit for a dealer and how much has been used today?" },
      { label: 'Dealer escalation history', query: "Show me the escalation history for my dealers. Are there any unresolved issues I should know about?" },
      { label: 'New dealer performance', query: "How are newly onboarded dealers performing? Show me their first 30-day payment metrics." },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    Icon: BarChart2,
    prompts: [
      { label: 'Request payment limit override', query: "A dealer has hit their daily payment limit. What's the process to request a temporary override?" },
      { label: 'Failed payment analysis', query: "Show me all failed payments from today. What were the reasons and what action is needed?" },
      { label: 'Check IMPS transfer status', query: "Can you check the status of a specific IMPS transfer and tell me if there are any issues?" },
      { label: 'Overdue EMI accounts', query: "Which accounts in my bucket have overdue EMIs? Show me sorted by number of days overdue." },
      { label: 'Payment reconciliation', query: "Help me reconcile today's payments. Are there any discrepancies between collected and posted amounts?" },
    ],
  },
  {
    id: 'escalations',
    label: 'Escalations',
    Icon: AlertCircle,
    prompts: [
      { label: 'Raise a new escalation', query: "I need to raise an escalation for a dealer or customer issue. Can you guide me through the process?" },
      { label: 'Check escalation status', query: "What is the current status of my open escalations? Which ones need my attention today?" },
      { label: 'High-risk account flags', query: "Show me accounts flagged as high-risk in my portfolio. What actions are recommended?" },
      { label: 'Legal action cases', query: "Which accounts in my bucket have been moved to legal action? What's the latest status?" },
      { label: 'Send case to risk team', query: "I need to send a case to the risk team for manual review. What information do I need to provide?" },
    ],
  },
];

type FlowState = 
  | 'GREETING' 
  | 'LISTENING' 
  | 'REASONING' 
  | 'DIAGNOSIS' 
  | 'RETRIEVING' 
  | 'RESOLUTION' 
  | 'EXECUTING' 
  | 'SUCCESS';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  type: 'text' | 'progress' | 'options' | 'resolution_options' | 'action_grid';
  content?: string;
  meta?: any; // To store specific IDs or config
}

export const SalesChat = () => {
  const [flowState, setFlowState] = useState<FlowState>('GREETING');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [prefillText, setPrefillText] = useState('');

  // --- Data & Steps ---
  
  const [reasoningSteps, setReasoningSteps] = useState<Step[]>([
    { id: '1', label: 'Analyzing intent', status: 'pending' },
    { id: '2', label: 'Checking context', status: 'pending' },
    { id: '3', label: 'Verifying permissions', status: 'pending' }
  ]);

  const [retrievalSteps, setRetrievalSteps] = useState<Step[]>([
    { id: '1', label: 'Checking allowed transfer amount', status: 'pending' },
    { id: '2', label: 'Checking amount already used today', status: 'pending' },
    { id: '3', label: 'Checking current payment amount', status: 'pending' }
  ]);

  const [executionSteps, setExecutionSteps] = useState<Step[]>([
    { id: '1', label: 'Checking dealer eligibility', status: 'pending' },
    { id: '2', label: 'Verifying compliance rules', status: 'pending' },
    { id: '3', label: 'Sending approval request', status: 'pending' },
    { id: '4', label: 'Awaiting confirmation', status: 'pending' }
  ]);

  const diagnosisOptions: Option[] = [
    { id: 'limit', label: 'Check today’s transfer allowance', description: 'View current daily limits' },
    { id: 'details', label: 'View dealer account details', description: 'Recent activity and status' },
    { id: 'value', label: 'Review current payment value', description: 'Analyze specific transaction' }
  ];

  const resolutionOptions: Option[] = [
    { id: 'increase', label: 'Increase daily transfer limit for today', description: 'Temporary override' },
    { id: 'split', label: 'Split payment into smaller parts', description: 'Multiple transactions' },
    { id: 'risk', label: 'Send to risk team for approval', description: 'Manual review required' }
  ];

  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<string | null>(null);
  const salesActions: NextActionItem[] = [
    { id: 'bucket', label: "What's in my bucket", icon: <FileText size={18} /> },
    { id: 'follow_ups', label: 'Follow-ups for today', icon: <Calendar size={18} /> },
    { id: 'ptp_tracker', label: 'Check my PTP tracker', icon: <BarChart2 size={18} /> },
    { id: 'open_cases', label: 'Check open cases for resolution', icon: <CheckCircle2 size={18} /> },
  ];

  const handleReset = () => {
    setMessages([]);
    setFlowState('GREETING');
    setPrefillText('');
  };

  // --- Helpers ---

  const addMessage = (
    role: 'user' | 'assistant' | 'system', 
    type: Message['type'] = 'text', 
    content: string = '', 
    meta: any = {}
  ) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role,
      type,
      content,
      meta
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, flowState, reasoningSteps, retrievalSteps, executionSteps]);

  // --- Flow Logic ---

  // 1. Initial Greeting
  useEffect(() => {
    // Only set initial delay logic if needed, but we render greeting statically first
  }, [flowState]);

  // 2. User Input Handler
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    addMessage('user', 'text', text);
    setFlowState('REASONING');
  };

  const handleQuickAction = (actionId: string) => {
    const textMap: Record<string, string> = {
      bucket: "What's in my bucket",
      follow_ups: 'Follow-ups for today',
      ptp_tracker: 'Check my PTP tracker',
      open_cases: 'Check open cases for resolution',
    };
    addMessage('user', 'text', textMap[actionId] || 'Help');
    setFlowState('REASONING');
  };

  // 3. Reasoning Simulation
  useEffect(() => {
    if (flowState === 'REASONING') {
      const runSteps = async () => {
        addMessage('assistant', 'text', "I'm analyzing the situation...");
        await new Promise(r => setTimeout(r, 600));
        
        // Add progress card
        addMessage('assistant', 'progress', '', { id: 'reasoning' });

        for (let i = 0; i < reasoningSteps.length; i++) {
          setReasoningSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
          await new Promise(r => setTimeout(r, 1200));
          setReasoningSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s));
          await new Promise(r => setTimeout(r, 200));
        }

        await new Promise(r => setTimeout(r, 500));
        addMessage('assistant', 'text', "This looks like a payment limit issue for the dealer.");
        addMessage('system', 'options', '', { id: 'diagnosis' });
        setFlowState('DIAGNOSIS');
      };
      runSteps();
    }
  }, [flowState]);

  // 4. Diagnosis Selection -> Retrieving
  const handleDiagnosisSelect = (id: string) => {
    setSelectedDiagnosis(id);
    setTimeout(() => {
        addMessage('user', 'text', diagnosisOptions.find(o => o.id === id)?.label || 'Selected option');
        setFlowState('RETRIEVING');
    }, 400);
  };

  // 5. Retrieving Simulation
  useEffect(() => {
    if (flowState === 'RETRIEVING') {
      const runSteps = async () => {
        addMessage('assistant', 'text', "Checking dealer transfer details...");
        await new Promise(r => setTimeout(r, 600));

        addMessage('assistant', 'progress', '', { id: 'retrieving' });

        for (let i = 0; i < retrievalSteps.length; i++) {
          setRetrievalSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
          await new Promise(r => setTimeout(r, 1200));
          setRetrievalSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s));
          await new Promise(r => setTimeout(r, 200));
        }

        await new Promise(r => setTimeout(r, 500));
        addMessage('assistant', 'text', "I found the issue. The dealer has reached their daily limit.");
        addMessage('system', 'resolution_options');
        setFlowState('RESOLUTION');
      };
      runSteps();
    }
  }, [flowState]);

  // 6. Resolution Selection -> Executing
  const handleResolutionSelect = (id: string) => {
    setSelectedResolution(id);
  };

  const handleProceedResolution = () => {
    if (!selectedResolution) return;
    addMessage('user', 'text', "Proceed with " + resolutionOptions.find(o => o.id === selectedResolution)?.label);
    setFlowState('EXECUTING');
  };

  // 7. Execution Simulation (6-8s)
  useEffect(() => {
    if (flowState === 'EXECUTING') {
      const runSteps = async () => {
        addMessage('assistant', 'text', "Processing request...");
        await new Promise(r => setTimeout(r, 600));

        addMessage('assistant', 'progress', '', { id: 'executing' });

        for (let i = 0; i < executionSteps.length; i++) {
          setExecutionSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
          const duration = 1500 + Math.random() * 500;
          await new Promise(r => setTimeout(r, duration));
          setExecutionSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s));
          await new Promise(r => setTimeout(r, 200));
        }

        await new Promise(r => setTimeout(r, 800));
        setFlowState('SUCCESS');
      };
      runSteps();
    }
  }, [flowState]);

  // 8. Success
  useEffect(() => {
    if (flowState === 'SUCCESS') {
      addMessage('assistant', 'text', "You can retry the payment now.");
    }
  }, [flowState]);


  // --- Rendering Content ---

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'text') {
      return (
        <MessageBubble 
          role={msg.role as any} 
          content={msg.content} 
          typing={msg.role === 'assistant'}
        />
      );
    }

    if (msg.type === 'progress') {
      let steps: Step[] = [];
      let title = '';
      if (msg.meta?.id === 'reasoning') {
        steps = reasoningSteps;
        title = "Understanding the issue";
      } else if (msg.meta?.id === 'retrieving') {
        steps = retrievalSteps;
        title = "Checking dealer details";
      } else if (msg.meta?.id === 'executing') {
        steps = executionSteps;
        title = "Executing resolution";
      }
      return <ProgressCard title={title} steps={steps} />;
    }

    if (msg.type === 'options') {
      return (
        <div className="space-y-2 animate-fade-in-up my-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 ml-1">Suggested Diagnoses:</p>
          {diagnosisOptions.map(opt => (
            <DiagnosisOption 
              key={opt.id} 
              option={opt} 
              selected={selectedDiagnosis === opt.id}
              onSelect={() => handleDiagnosisSelect(opt.id)}
            />
          ))}
        </div>
      );
    }

    if (msg.type === 'resolution_options') {
      return (
        <div className="space-y-4 animate-fade-in-up my-4">
          <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 ml-1">Resolution Options:</p>
              {resolutionOptions.map(opt => (
              <DiagnosisOption 
                  key={opt.id} 
                  option={opt} 
                  selected={selectedResolution === opt.id}
                  onSelect={() => handleResolutionSelect(opt.id)}
              />
              ))}
          </div>
          
          {selectedResolution && flowState === 'RESOLUTION' && (
             <motion.button
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               onClick={handleProceedResolution}
               className="w-full py-3 bg-blue-600 dark:bg-[#0a84ff] text-white rounded-xl font-medium shadow-md shadow-blue-600/20 dark:shadow-blue-500/20 hover:bg-blue-700 dark:hover:bg-[#0071e3] transition-all flex items-center justify-center gap-2"
             >
               Proceed
               <ArrowRight size={18} />
             </motion.button>
          )}
        </div>
      );
    }
    return null;
  };

  const chatTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  // ── Welcome / greeting state — centred layout matching HR / AI Unit ──────
  // ── Chat state — message feed + pinned bottom input ──────────────────────
  return (
    <AnimatePresence mode="wait">
      {flowState === 'GREETING' ? (
        <motion.div
          key="greeting"
          className="flex flex-col items-center justify-center h-full px-4 py-8 gap-5 overflow-y-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={chatTransition}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <p style={{ fontSize: '32px', fontFamily: "'Lora', serif", fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Hi Rahul
            </p>
            <h1 style={{ fontSize: '40px', fontFamily: "'Lora', serif", fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
              Where should we start?
            </h1>
          </div>

          <div className="w-full max-w-xl">
            <ChatComposer
              placeholder="How can I help you today?"
              prefillValue={prefillText}
              onSendMessage={handleSendMessage}
            />
          </div>

          <SuggestiveActions
            categories={DMS_CATEGORIES}
            onHoverPrompt={setPrefillText}
            onSelectPrompt={handleSendMessage}
          />
        </motion.div>
      ) : (
        <motion.div
          key="chat"
          className="flex flex-col h-full max-w-2xl mx-auto px-4 sm:px-0 relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={chatTransition}
        >
          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide px-[12px] pt-[24px] pb-[128px]">
            {messages.map((msg) => (
              <div key={msg.id}>
                {renderMessageContent(msg)}
              </div>
            ))}

            {flowState === 'SUCCESS' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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

            <div ref={messagesEndRef} className="h-4" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-12 bg-gradient-to-t from-gray-50 via-gray-50 dark:from-[#1a1a1f] dark:via-[#1a1a1f] to-transparent z-10">
            <ChatComposer
              placeholder={flowState === 'SUCCESS' ? 'Anything else?' : 'Processing…'}
              disabled={flowState !== 'SUCCESS'}
              onSendMessage={handleSendMessage}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
