import React from 'react';
import { AppShell, type ConversationItem, type UserInfo } from './AppShell';
import { NotificationPanel, NotificationMobilePanel } from './NotificationPanel';
import { CorporateChat } from './CorporateChat';

const CONVERSATIONS: ConversationItem[] = [
  { id: 1, title: 'AI Project milestone review', time: 'Just now', active: true, sub: 'In progress' },
  { id: 2, title: 'IT attrition summary', time: '2h ago', active: false, sub: 'Completed' },
  { id: 3, title: 'EMC minutes recap', time: 'Yesterday', active: false, sub: 'Completed' },
  { id: 4, title: 'DP KID update', time: '2d ago', active: false, sub: 'Completed' },
  { id: 5, title: 'Go-live delay report', time: '3d ago', active: false, sub: 'Completed' },
];

const USER: UserInfo = {
  name: 'Anurag Chottani',
  initials: 'AC',
  role: 'Chief Operating Officer',
  avatarColor: '#0e7490',
};

export function CorporateHome() {
  return (
    <AppShell
      conversations={CONVERSATIONS}
      user={USER}
      accentBorderColor="rgba(14,116,144,0.2)"
      accentTextColor="#0e7490"
      rightPanel={
        <NotificationPanel
          profile="corporate"
          desktopWidthClass="w-[22rem]"
          className="border-l border-gray-200 dark:border-white/5"
        />
      }
      rightPanelMobile={(onClose) => (
        <NotificationMobilePanel profile="corporate" onClose={onClose} />
      )}
    >
      <CorporateChat />
    </AppShell>
  );
}
