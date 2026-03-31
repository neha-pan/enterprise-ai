import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { NotificationMobilePanel, NotificationPanel } from './NotificationPanel';
import { AppShell, type ConversationItem, type UserInfo } from './AppShell';
import { RcommsChat } from './RcommsChat';

const CONVERSATIONS: ConversationItem[] = [
  { id: 1, title: 'Deviation spike — Consumer Durables', time: 'Just now', active: true, sub: 'In progress' },
  { id: 2, title: 'TAT breach — Business Loans', time: '1h ago', active: false, sub: 'Completed' },
  { id: 3, title: 'STP leakage review', time: '3h ago', active: false, sub: 'Completed' },
  { id: 4, title: 'Nashik branch deviation audit', time: 'Yesterday', active: false, sub: 'Completed' },
  { id: 5, title: 'MTD disbursal summary', time: '2d ago', active: false, sub: 'Completed' },
  { id: 6, title: 'Pending approvals clearance', time: '3d ago', active: false, sub: 'Completed' },
  { id: 7, title: 'Queue redistribution — March', time: '5d ago', active: false, sub: 'Completed' },
];

const USER: UserInfo = {
  name: 'Amit Shah',
  initials: 'AS',
  role: 'Regional Credit Ops Manager, Pune',
  avatarColor: '#0f766e',
};

export function RcommsHome() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  return (
    <AppShell
      conversations={CONVERSATIONS}
      user={USER}
      accentBorderColor="rgba(15,118,110,0.2)"
      accentTextColor="#0f766e"
      rightPanel={
        <NotificationPanel
          profile="rcomms"
          desktopWidthClass="w-[22rem]"
          className="border-l border-gray-200 dark:border-white/5"
        />
      }
      rightPanelMobile={(onClose) => (
        <NotificationMobilePanel profile="rcomms" onClose={onClose} />
      )}
    >
      <RcommsChat />
    </AppShell>
  );
}
