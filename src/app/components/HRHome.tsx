import React, { useState } from 'react';
import { FileText, Calendar, Users, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatComposer } from './ChatComposer';
import { AppShell, type ConversationItem, type UserInfo } from './AppShell';
import { NotificationPanel, NotificationMobilePanel } from './NotificationPanel';
import { SuggestiveActions, type SuggestiveCategory } from './SuggestiveActions';

const CONVERSATIONS: ConversationItem[] = [
  { id: 1, title: 'Policy handbook update', time: 'Just now', active: true, sub: 'Drafting response...' },
  { id: 2, title: 'Leave balance clarification', time: '1h ago', active: false, sub: 'Resolved' },
  { id: 3, title: 'Onboarding checklist', time: 'Yesterday', active: false, sub: 'Resolved' },
];

const USER: UserInfo = {
  name: 'Roshni Kale',
  initials: 'RK',
  role: 'Senior Lead',
  avatarColor: '#d97706',
};

const HR_CATEGORIES: SuggestiveCategory[] = [
  {
    id: 'policies',
    label: 'Policies',
    Icon: FileText,
    prompts: [
      { label: 'Work from home policy', query: "What is the current work from home policy? How many WFH days are employees allowed per week?" },
      { label: 'Leave encashment rules', query: "What are the rules for leave encashment? Can employees encash unused earned leaves this year?" },
      { label: 'Travel & expense policy', query: "What does the travel and expense policy cover? What are the approval limits for business travel?" },
      { label: 'Code of conduct guidelines', query: "Can you summarise the key points of the employee code of conduct policy?" },
      { label: 'Employee referral programme', query: "What are the details of the employee referral programme? What's the referral bonus and process?" },
    ],
  },
  {
    id: 'leave',
    label: 'Leave Management',
    Icon: Calendar,
    prompts: [
      { label: 'Pending leave approvals', query: "Are there any leave requests pending my approval? Show me names, dates and leave types." },
      { label: 'Team leave calendar', query: "Show me the team leave calendar for the next 2 weeks. Who is on leave and when?" },
      { label: 'Leave balance summary', query: "Show a leave balance summary for my direct reports — earned, sick and casual leaves." },
      { label: 'Employees with no leave balance', query: "Are there any employees who have exhausted their leave balance? What options are available?" },
      { label: 'Quarterly leave utilisation report', query: "Generate a quarterly leave utilisation report for my team. Who has high or low leave consumption?" },
    ],
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    Icon: Users,
    prompts: [
      { label: 'Open positions in my team', query: "What positions are currently open in my team? What's the status of each requisition?" },
      { label: 'Onboarding checklist status', query: "Which new joiners are currently in onboarding? Is everything on track for them?" },
      { label: 'Interview schedule this week', query: "Do I have any interviews scheduled today or this week? Show me the candidates and roles." },
      { label: 'Offer letter status', query: "What is the status of pending offer letters? Have all candidates responded?" },
      { label: 'Probation reviews due', query: "Which employees are coming up for their probation completion review in the next 30 days?" },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll & Benefits',
    Icon: BarChart2,
    prompts: [
      { label: 'Payroll processing status', query: "What is the status of this month's payroll processing? Has it been finalised?" },
      { label: 'Expense claims pending approval', query: "Are there any expense claims pending my approval? Show me the amounts and submitters." },
      { label: 'Salary revision cycle', query: "When is the next salary revision cycle? What is the process and timeline?" },
      { label: 'Variable pay calculation', query: "How is the variable pay calculated for my team this quarter? What are the performance multipliers?" },
      { label: 'Tax declaration status', query: "Have all employees in my team submitted their investment declarations for this financial year?" },
    ],
  },
];

export function HRHome() {
  const [prefillText, setPrefillText] = useState('');
  const [chatKey, setChatKey] = useState(0);

  const handleNewChat = () => {
    setPrefillText('');
    setChatKey(k => k + 1);
  };

  return (
    <AppShell
      conversations={CONVERSATIONS}
      user={USER}
      accentBorderColor="rgba(217,119,6,0.2)"
      accentTextColor="#b45309"
      onNewChat={handleNewChat}
      rightPanel={
        <NotificationPanel
          profile="hr"
          desktopWidthClass="w-[22rem]"
          className="border-l border-gray-200 dark:border-white/5"
        />
      }
      rightPanelMobile={(onClose) => (
        <NotificationMobilePanel profile="hr" onClose={onClose} />
      )}
    >
      <AnimatePresence mode="wait">
      <motion.div
        key={chatKey}
        className="h-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
      <div className="flex flex-col items-center justify-center h-full px-4 py-8 gap-5 overflow-y-auto">
        {/* Badge + greeting */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p style={{ fontSize: '32px', fontFamily: "'Lora', serif", fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.2 }}>Hi Roshni</p>
          <h1
            style={{ fontSize: '40px', fontFamily: "'Lora', serif", fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.15 }}
          >
            Where should we start?
          </h1>
        </div>

        {/* Chat input */}
        <div className="w-full max-w-xl">
          <ChatComposer prefillValue={prefillText} onSendMessage={(q) => setPrefillText(q)} />
        </div>

        {/* Suggestive action categories */}
        <SuggestiveActions
          categories={HR_CATEGORIES}
          onHoverPrompt={setPrefillText}
          onSelectPrompt={(q) => setPrefillText(q)}
        />
      </div>
      </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
