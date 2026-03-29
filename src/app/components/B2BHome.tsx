import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { B2BChat, type B2BContext } from './B2BChat';
import { useAuth } from '../context/AuthContext';
import { NotificationMobilePanel, NotificationPanel } from './NotificationPanel';
import { AppShell, type ConversationItem, type UserInfo } from './AppShell';

const CONVERSATIONS: ConversationItem[] = [
  { id: 1, title: 'Update customer name', time: 'Just now', active: true, sub: 'In progress' },
  { id: 2, title: 'Apply casual leave', time: '20m ago', active: false, sub: 'Completed' },
  { id: 3, title: 'Fuel claim status', time: '3h ago', active: false, sub: 'Completed' },
  { id: 4, title: 'Customer name correction', time: 'Yesterday', active: false, sub: 'Completed' },
  { id: 5, title: 'ETB DO governance rules', time: '2d ago', active: false, sub: 'Completed' },
  { id: 6, title: 'Delayed dealer disbursal', time: '3d ago', active: false, sub: 'Completed' },
  { id: 7, title: 'Pending mandatory trainings', time: '4d ago', active: false, sub: 'Completed' },
  { id: 8, title: 'Flexi Loan product overview', time: '5d ago', active: false, sub: 'Completed' },
  { id: 9, title: 'Travel policy for dealer visits', time: '6d ago', active: false, sub: 'Completed' },
];

const USER: UserInfo = {
  name: 'Rahul Shah',
  initials: 'RS',
  role: 'Sales Manager, Nagpur',
  avatarColor: '#7c3aed',
};

export function B2BHome() {
  const [, setCtx] = useState<B2BContext>({ status: 'waiting' });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  return (
    <AppShell
      conversations={CONVERSATIONS}
      user={USER}
      accentBorderColor="rgba(124,58,237,0.2)"
      accentTextColor="#7c3aed"
      rightPanel={
        <NotificationPanel
          profile="b2b"
          desktopWidthClass="w-[22rem]"
          className="border-l border-gray-200 dark:border-white/5"
        />
      }
      rightPanelMobile={(onClose) => (
        <NotificationMobilePanel profile="b2b" onClose={onClose} />
      )}
    >
      <B2BChat onContextUpdate={setCtx} />
    </AppShell>
  );
}
