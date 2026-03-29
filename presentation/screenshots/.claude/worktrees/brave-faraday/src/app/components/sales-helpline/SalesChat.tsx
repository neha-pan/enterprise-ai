import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageBubble, 
  ProgressCard, 
  QuickActionGrid, 
  DiagnosisOption, 
  InputArea,
  Step,
  Option
} from './SalesComponents';
import { 
  CreditCard, 
  FileText, 
  ShieldAlert, 
  UserCheck,
  ArrowRight,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';

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
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    addMessage('user', 'text', inputValue);
    setInputValue('');
    setFlowState('REASONING');
  };

  const handleQuickAction = (actionId: string) => {
    const textMap: Record<string, string> = {
      'payment_limit': 'Check payment limit',
      'dealer_status': 'Check dealer status',
      'compliance': 'Compliance check',
      'pending_imps': 'Fix Pending IMPS'
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
          <p className="text-sm text-gray-400 mb-2 ml-1">Suggested Diagnoses:</p>
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
              <p className="text-sm text-gray-400 mb-2 ml-1">Resolution Options:</p>
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
               className="w-full py-3 bg-[#0a84ff] text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:bg-[#0071e3] transition-all flex items-center justify-center gap-2"
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

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 sm:px-0 relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide px-[12px] pt-[24px] pb-[128px]">
        
        {/* Dynamic Greeting */}
        {flowState === 'GREETING' && messages.length === 0 && (
           <div className="mb-8 mt-4">
             <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-serif font-semibold text-white tracking-tight mb-1"
             >
               Afternoon, Rahul Ved
             </motion.h1>
             <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.22 }}
                className="text-base font-medium text-gray-500 mb-8"
             >
               Sales Manager • North Region
             </motion.p>
             
             <QuickActionGrid 
               delay={0.3}
               actions={[
                 { id: 'pending_imps', label: 'Fix Pending IMPS', icon: <AlertOctagon size={20} />, priority: true, count: 3 },
                 { id: 'payment_limit', label: 'Check payment limit', icon: <CreditCard size={20} /> },
                 { id: 'dealer_status', label: 'Dealer status', icon: <UserCheck size={20} /> },
                 { id: 'compliance', label: 'Compliance rules', icon: <ShieldAlert size={20} /> },
               ]}
               onActionClick={handleQuickAction} 
             />
           </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
             {renderMessageContent(msg)}
          </div>
        ))}

        {flowState === 'SUCCESS' && (
             <motion.button
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="w-full py-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl font-medium flex items-center justify-center gap-2 mt-4"
           >
             <CheckCircle2 size={20} />
             Retry Payment
           </motion.button>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area (Fixed at bottom) */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-12 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f] to-transparent z-10">
        <InputArea 
            value={inputValue} 
            onChange={setInputValue} 
            onSend={handleSendMessage}
            delay={0.24}
            placeholder={
                flowState === 'GREETING' ? "How can I help you today?" :
                flowState === 'SUCCESS' ? "Anything else?" :
                "Processing..."
            }
            disabled={flowState !== 'GREETING' && flowState !== 'SUCCESS'} 
        />
      </div>
    </div>
  );
};
