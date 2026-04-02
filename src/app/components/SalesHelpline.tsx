import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SalesChat } from './sales-helpline/SalesChat';
import { NotificationMobilePanel, NotificationPanel } from './NotificationPanel';
import { AppShell, type ConversationItem, type UserInfo } from './AppShell';

const CONVERSATIONS: ConversationItem[] = [
  { id: 1, title: 'Dealer #4928 Payment', time: 'Just now', active: true, sub: 'Processing...' },
  { id: 2, title: 'Pricing Inquiry #229', time: '45m ago', active: false, sub: 'Resolved' },
  { id: 3, title: 'System Access Issue', time: '4h ago', active: false, sub: 'Resolved' },
  { id: 4, title: 'EMI Restructure Request', time: 'Yesterday', active: false, sub: 'Resolved' },
  { id: 5, title: 'Dealer Onboarding #7732', time: '2d ago', active: false, sub: 'Resolved' },
  { id: 6, title: 'Collection Escalation', time: '3d ago', active: false, sub: 'Resolved' },
  { id: 7, title: 'Portfolio Risk Review', time: '4d ago', active: false, sub: 'Resolved' },
  { id: 8, title: 'KYC Document Verification', time: '5d ago', active: false, sub: 'Resolved' },
  { id: 9, title: 'Loan Disbursement Status', time: '6d ago', active: false, sub: 'Resolved' },
];

const USER: UserInfo = {
  name: 'Rahul Ved',
  initials: 'RV',
  role: 'Collection Manager',
  avatarColor: '#2563eb',
};

export function SalesHelpline() {
  const [chatKey, setChatKey] = useState(0);

  return (
    <AppShell
      conversations={CONVERSATIONS}
      user={USER}
      accentBorderColor="rgba(37,99,235,0.2)"
      accentTextColor="#2563eb"
      onNewChat={() => setChatKey(k => k + 1)}
      rightPanel={
        <NotificationPanel
          profile="dms"
          desktopWidthClass="w-[22rem]"
          className="border-l border-gray-200 dark:border-white/5 bg-white/95 dark:bg-[#1a1a1f]/95 shadow-xl"
        />
      }
      rightPanelMobile={(onClose) => (
        <NotificationMobilePanel profile="dms" onClose={onClose} />
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
          <SalesChat />
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
