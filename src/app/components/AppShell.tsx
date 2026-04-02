import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  PanelRight,
  Plus,
  Star,
  Sun,
  Trash2,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConversationItem {
  id: number;
  title: string;
  time: string;
  sub: string;
  active: boolean;
  starred?: boolean;
}

export interface UserInfo {
  name: string;
  initials: string;
  role: string;
  avatarColor: string; // hex or CSS color
}

interface AppShellProps {
  conversations: ConversationItem[];
  user: UserInfo;
  /** rgba string used as active conversation border colour */
  accentBorderColor?: string;
  /** solid colour used for active conversation sub-text */
  accentTextColor?: string;
  /** Desktop right panel — rendered directly in flex row (manages its own visibility) */
  rightPanel?: React.ReactNode;
  /** Mobile right panel — render prop receives onClose callback */
  rightPanelMobile?: (onClose: () => void) => React.ReactNode;
  /** Called when the user clicks "New Chat" in the sidebar */
  onNewChat?: () => void;
  children: React.ReactNode;
}

// ── Logo SVG (full Bajaj Finserv wordmark) ────────────────────────────────────

function FullLogo() {
  return (
    <svg width="101" height="32" viewBox="0 0 67 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_shell_logo_full)">
        <path d="M47.0768 12.8024L45.0721 16.2943H43.3262L46.1391 11.7031H48.0467L50.8273 16.2943H49.0814L48.5964 15.486H46.0098L46.4301 14.7747C46.5271 14.6131 46.7211 14.5161 46.9151 14.5161H48.0467L47.0768 12.8024Z" fill="#005DAC"/>
        <path d="M37.1826 11.7031H35.6953V16.2943H37.1826V11.7031Z" fill="#005DAC"/>
        <path d="M41.3544 11.7031V14.2897L39.5761 11.7031H37.7979V16.2943H39.2851V13.7401L39.3175 13.7724L41.0311 16.2943H42.8417V11.7031H41.3544Z" fill="#005DAC"/>
        <path d="M54.8368 11.7031V14.2897L53.0908 11.7031H51.3125V16.2943H52.7998V13.7401V13.7724L54.5458 16.2943H56.324V11.7031H54.8368Z" fill="#005DAC"/>
        <path d="M30.7168 11.7031V16.2943H30.9108H32.2041V14.4514H33.4974C33.7884 14.4514 33.8854 14.2574 33.8854 14.2574L34.338 13.5137H32.2041V13.2228C32.2364 12.6731 32.7537 12.6731 32.7537 12.6731H34.3057C34.629 12.6731 34.726 12.5114 34.726 12.5114L35.211 11.7355H30.7168V11.7031Z" fill="#005DAC"/>
        <path d="M63.8253 13.2551V13.5137H65.9592L65.5066 14.2574C65.5066 14.2574 65.4096 14.4514 65.1186 14.4514H63.8576V14.8717C63.8576 14.8717 63.8576 14.904 63.8576 14.9687C63.9223 15.195 64.1486 15.3567 64.375 15.3567H66.2179H66.6059V16.2943H62.3057V11.7031H66.6059V12.6408H64.375C64.084 12.6731 63.8253 12.9318 63.8253 13.2551Z" fill="#005DAC"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M56.8086 13.9664C56.8086 13.9987 56.8086 14.0311 56.8086 14.0311C56.8086 14.3867 56.8733 14.7101 57.0026 15.0334C57.1319 15.3567 57.2936 15.6154 57.4876 15.8417C57.5199 15.874 57.5199 15.874 57.5522 15.9064C57.9079 16.262 58.5222 16.2943 58.9749 16.2943H61.8201L61.4645 15.583C61.4322 15.5184 61.3675 15.4537 61.3028 15.389C61.2382 15.3567 61.1735 15.3244 61.0765 15.3244H60.1388C59.3952 15.3244 58.2959 15.2597 58.2959 14.0311V13.9987V13.9664C58.2959 12.7378 59.4275 12.6731 60.1388 12.6731H61.0765C61.1412 12.6731 61.2382 12.6408 61.3028 12.6084C61.3675 12.5761 61.4322 12.5114 61.4645 12.4144L61.8201 11.7031H58.9749C58.4899 11.7031 57.9079 11.7355 57.5522 12.0911C57.5199 12.1234 57.5199 12.1234 57.4876 12.1558C57.2936 12.3821 57.0996 12.6731 57.0026 12.9641C56.8733 13.2874 56.8409 13.6431 56.8086 13.9664Z" fill="#005DAC"/>
        <path d="M28 -0.000976562H0V27.999H28V-0.000976562Z" fill="#005DAC"/>
        <path d="M1.55273 26.4469V22.7286H4.85066C5.52964 22.7286 6.62895 22.8256 6.62895 23.6986C6.62895 24.1189 6.24096 24.4422 5.7883 24.5392C6.33795 24.7009 6.62895 25.0242 6.62895 25.4446C6.62895 26.3499 5.5943 26.4469 4.85066 26.4469H1.55273ZM2.74904 24.8949L3.1047 24.3129C3.2017 24.1836 3.33103 24.1189 3.49269 24.1189H4.85066C5.07698 24.1189 5.30331 24.0219 5.30331 23.8279C5.30331 23.6339 5.10932 23.5369 4.85066 23.5369H2.74904V24.8949ZM2.74904 24.8949V26.4792L3.1047 25.8649C3.2017 25.7356 3.33103 25.6709 3.49269 25.6709H4.81832C5.07698 25.6709 5.27098 25.5092 5.27098 25.2829C5.27098 25.0566 5.07698 24.8949 4.81832 24.8949H2.74904ZM9.57121 23.6339L7.92225 26.4792H6.49962L8.79523 22.7286H10.3472L12.6105 26.4469H11.1878L10.7998 25.7679H8.69823L9.05389 25.2182C9.15089 25.0889 9.28022 25.0242 9.44188 25.0242H10.3472L9.57121 23.6339ZM19.4973 23.6339L17.8483 26.4792H16.4257L18.7213 22.7286H20.2733L22.5689 26.4792H21.1463L20.7583 25.8002H18.6567L19.0123 25.2182C19.1093 25.0889 19.2386 25.0242 19.4003 25.0242H20.3056L19.4973 23.6339ZM14.8414 25.6709C15.1324 25.6709 15.3264 25.5416 15.3264 25.2506V22.6963H16.5227V25.3476C16.5227 26.1559 16.0054 26.4145 15.2941 26.4145H13.2895C13.1278 26.4145 12.9985 26.3499 12.9015 26.2205L12.5458 25.6386L14.8414 25.6709ZM24.7352 25.6709C25.0262 25.6709 25.2202 25.5416 25.2202 25.2506V22.6963H26.4165V25.3476C26.4165 26.1559 25.8992 26.4145 25.1878 26.4145H23.1832C23.0216 26.4145 22.8922 26.3499 22.7952 26.2205L22.4396 25.6386L24.7352 25.6709Z" fill="white"/>
        <path d="M14.5179 5.33309C13.354 5.39776 11.9313 5.62409 10.832 5.97974C10.638 6.04441 9.89437 6.27074 10.153 6.59406C10.444 6.94972 11.511 6.62639 11.9313 6.56173C13.1276 6.40007 16.8459 5.85041 16.0699 8.17836C15.8436 8.85734 15.1646 9.60099 14.6796 10.086C14.1299 9.76265 13.1276 9.27767 13.1276 9.27767C12.6103 9.019 12.0607 8.76034 11.511 8.53402C10.9937 8.30769 9.60338 7.69337 9.11839 7.7257C8.66574 7.75803 8.40708 8.11369 8.7304 8.53402C9.0214 8.92201 10.0884 9.407 10.5734 9.66566C10.8967 9.85965 13.16 11.1853 13.1923 11.3469C13.1923 11.4116 13.0306 11.5086 12.966 11.5409C11.899 12.3493 10.7027 12.8989 9.53872 13.5779C9.18306 13.7719 8.37474 14.2245 8.69807 14.7419C9.0214 15.2269 9.92671 14.8065 10.347 14.6772C13.1276 13.6749 17.3309 11.4763 18.8828 8.85734C20.8551 5.62409 16.6195 5.23609 14.5179 5.33309Z" fill="white"/>
        <path d="M19.3027 14.7422C19.1088 13.9662 18.0741 12.6406 17.4598 12.1556C17.4598 12.1556 17.4275 12.1556 17.4275 12.1233C17.4275 12.1233 17.3951 12.0909 17.2981 12.0586L17.2658 12.0909L15.3582 13.3519C15.7785 13.9662 16.2635 14.5159 16.1665 15.3242C16.0372 16.3912 14.2265 16.3912 13.4506 16.3588C12.6099 16.3265 11.7693 16.0678 10.9609 16.0032C10.67 15.9708 9.76464 16.1002 10.2496 16.5205C10.67 16.8761 12.8686 17.2318 13.4829 17.2965C15.1642 17.4905 20.1111 17.6845 19.3027 14.7422Z" fill="white"/>
      </g>
      <defs>
        <clipPath id="clip0_shell_logo_full">
          <rect width="66.6697" height="28" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function IconMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 -0.000976562H0V27.999H28V-0.000976562Z" fill="#005DAC"/>
      <path d="M1.55273 26.4469V22.7286H4.85066C5.52964 22.7286 6.62895 22.8256 6.62895 23.6986C6.62895 24.1189 6.24096 24.4422 5.7883 24.5392C6.33795 24.7009 6.62895 25.0242 6.62895 25.4446C6.62895 26.3499 5.5943 26.4469 4.85066 26.4469H1.55273ZM2.74904 24.8949L3.1047 24.3129C3.2017 24.1836 3.33103 24.1189 3.49269 24.1189H4.85066C5.07698 24.1189 5.30331 24.0219 5.30331 23.8279C5.30331 23.6339 5.10932 23.5369 4.85066 23.5369H2.74904V24.8949ZM2.74904 24.8949V26.4792L3.1047 25.8649C3.2017 25.7356 3.33103 25.6709 3.49269 25.6709H4.81832C5.07698 25.6709 5.27098 25.5092 5.27098 25.2829C5.27098 25.0566 5.07698 24.8949 4.81832 24.8949H2.74904ZM9.57121 23.6339L7.92225 26.4792H6.49962L8.79523 22.7286H10.3472L12.6105 26.4469H11.1878L10.7998 25.7679H8.69823L9.05389 25.2182C9.15089 25.0889 9.28022 25.0242 9.44188 25.0242H10.3472L9.57121 23.6339ZM19.4973 23.6339L17.8483 26.4792H16.4257L18.7213 22.7286H20.2733L22.5689 26.4792H21.1463L20.7583 25.8002H18.6567L19.0123 25.2182C19.1093 25.0889 19.2386 25.0242 19.4003 25.0242H20.3056L19.4973 23.6339ZM14.8414 25.6709C15.1324 25.6709 15.3264 25.5416 15.3264 25.2506V22.6963H16.5227V25.3476C16.5227 26.1559 16.0054 26.4145 15.2941 26.4145H13.2895C13.1278 26.4145 12.9985 26.3499 12.9015 26.2205L12.5458 25.6386L14.8414 25.6709ZM24.7352 25.6709C25.0262 25.6709 25.2202 25.5416 25.2202 25.2506V22.6963H26.4165V25.3476C26.4165 26.1559 25.8992 26.4145 25.1878 26.4145H23.1832C23.0216 26.4145 22.8922 26.3499 22.7952 26.2205L22.4396 25.6386L24.7352 25.6709Z" fill="white"/>
      <path d="M14.5179 5.33309C13.354 5.39776 11.9313 5.62409 10.832 5.97974C10.638 6.04441 9.89437 6.27074 10.153 6.59406C10.444 6.94972 11.511 6.62639 11.9313 6.56173C13.1276 6.40007 16.8459 5.85041 16.0699 8.17836C15.8436 8.85734 15.1646 9.60099 14.6796 10.086C14.1299 9.76265 13.1276 9.27767 13.1276 9.27767C12.6103 9.019 12.0607 8.76034 11.511 8.53402C10.9937 8.30769 9.60338 7.69337 9.11839 7.7257C8.66574 7.75803 8.40708 8.11369 8.7304 8.53402C9.0214 8.92201 10.0884 9.407 10.5734 9.66566C10.8967 9.85965 13.16 11.1853 13.1923 11.3469C13.1923 11.4116 13.0306 11.5086 12.966 11.5409C11.899 12.3493 10.7027 12.8989 9.53872 13.5779C9.18306 13.7719 8.37474 14.2245 8.69807 14.7419C9.0214 15.2269 9.92671 14.8065 10.347 14.6772C13.1276 13.6749 17.3309 11.4763 18.8828 8.85734C20.8551 5.62409 16.6195 5.23609 14.5179 5.33309Z" fill="white"/>
      <path d="M19.3027 14.7422C19.1088 13.9662 18.0741 12.6406 17.4598 12.1556C17.4598 12.1556 17.4275 12.1556 17.4275 12.1233C17.4275 12.1233 17.3951 12.0909 17.2981 12.0586L17.2658 12.0909L15.3582 13.3519C15.7785 13.9662 16.2635 14.5159 16.1665 15.3242C16.0372 16.3912 14.2265 16.3912 13.4506 16.3588C12.6099 16.3265 11.7693 16.0678 10.9609 16.0032C10.67 15.9708 9.76464 16.1002 10.2496 16.5205C10.67 16.8761 12.8686 17.2318 13.4829 17.2965C15.1642 17.4905 20.1111 17.6845 19.3027 14.7422Z" fill="white"/>
    </svg>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────

export function AppShell({
  conversations: initialConversations,
  user,
  accentBorderColor = 'rgba(37,99,235,0.2)',
  accentTextColor = '#2563eb',
  rightPanel,
  rightPanelMobile,
  onNewChat,
  children,
}: AppShellProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [isWideDesktopViewport, setIsWideDesktopViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1280 : true
  );

  // Mobile sidebar overlay open/closed
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop sidebar expanded/icon-rail
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  // Mobile right panel drawer
  const [rightOpen, setRightOpen] = useState(false);
  // User popup menu
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Conversations with mutable starred state
  type MutableConv = ConversationItem & { starred: boolean };
  const [conversations, setConversations] = useState<MutableConv[]>(
    () => initialConversations.map(c => ({ ...c, starred: c.starred ?? false }))
  );
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Close mobile sidebar when viewport grows to desktop
  useEffect(() => {
    const handler = () => {
      const nextIsDesktop = window.innerWidth >= 1024;
      const nextIsWideDesktop = window.innerWidth >= 1280;
      setIsDesktopViewport(nextIsDesktop);
      setIsWideDesktopViewport(nextIsWideDesktop);
      if (nextIsDesktop) setSidebarOpen(false);
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  // Close conversation ⋯ menu on any click
  useEffect(() => {
    if (activeMenuId === null) return;
    const handler = () => setActiveMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [activeMenuId]);

  const toggleStar = (id: number) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c));
    setActiveMenuId(null);
  };

  const deleteConversation = (id: number) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setActiveMenuId(null);
  };

  // Whether to show text labels in sidebar (always on mobile overlay, controlled by state on desktop)
  // We use a CSS trick: the desktop sidebar width class controls visibility via overflow+opacity
  const showLabels = sidebarExpanded;
  const shellEntryTransition = { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };
  const leftPanelEntryTransition = { duration: 0.42, delay: 0.08, ease: [0.22, 1, 0.36, 1] as const };
  const contentEntryTransition = { duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] as const };
  const rightPanelEntryTransition = { duration: 0.42, delay: 0.18, ease: [0.22, 1, 0.36, 1] as const };

  // ── Sidebar inner content (shared between mobile overlay and desktop) ───────

  const sidebarInner = (
    <>
      {/* Logo + collapse toggle */}
      <div
        className="flex items-center justify-between px-3 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center overflow-hidden">
          {/* On mobile always show full logo; on desktop show based on expanded state */}
          <span className={showLabels ? '' : 'lg:hidden'}>
            <FullLogo />
          </span>
          <span className={showLabels ? 'hidden' : 'hidden lg:block'}>
            <IconMark />
          </span>
        </div>
        <button
          onClick={() => setSidebarExpanded(e => !e)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:opacity-70 transition-opacity shrink-0 ml-1"
          style={{ color: 'var(--text-secondary)' }}
          aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarExpanded ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {/* New Chat button */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <button
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
          onClick={onNewChat}
        >
          <span
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            <Plus size={13} />
          </span>
          <span className={`text-sm whitespace-nowrap overflow-hidden transition-all ${showLabels ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 lg:max-w-0'}`}>
            New Chat
          </span>
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-2 pt-2 pb-2">
        {(() => {
          const starredConvs = conversations.filter(c => c.starred);
          const recentConvs = conversations.filter(c => !c.starred);

          const renderCard = (c: MutableConv) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="group relative mb-0.5"
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={`flex items-center gap-1.5 px-2 py-3 rounded-xl cursor-pointer transition-all border ${
                  c.active ? 'shadow-sm' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: c.active ? 'var(--surface-2)' : 'transparent',
                  borderColor: c.active ? accentBorderColor : 'transparent',
                }}
              >
                {showLabels ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-1">
                        <span
                          className="text-sm font-medium truncate leading-snug"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {c.title}
                        </span>
                        <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                          {c.time}
                        </span>
                      </div>
                    </div>
                    {(hoveredId === c.id || activeMenuId === c.id) && (
                      <button
                        className="shrink-0 w-5 h-5 flex items-center justify-center rounded opacity-60 hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--text-secondary)' }}
                        onClick={e => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === c.id ? null : c.id);
                        }}
                        aria-label="More options"
                      >
                        <MoreHorizontal size={13} />
                      </button>
                    )}
                  </>
                ) : (
                  <div
                    className="w-2 h-2 rounded-full mx-auto shrink-0"
                    style={{ backgroundColor: c.active ? accentTextColor : 'var(--border-subtle)' }}
                  />
                )}
              </div>

              {/* ⋯ dropdown */}
              {activeMenuId === c.id && (
                <div
                  className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-lg border py-1 min-w-[144px]"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => toggleStar(c.id)}
                  >
                    <Star size={13} fill={c.starred ? 'currentColor' : 'none'} />
                    {c.starred ? 'Unstar' : 'Star'}
                  </button>
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--status-danger)' }}
                    onClick={() => deleteConversation(c.id)}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </motion.div>
          );

          return (
            <AnimatePresence initial={false}>
              {starredConvs.length > 0 && showLabels && (
                <motion.p
                  key="starred-header"
                  layout
                  className="text-xs font-semibold uppercase tracking-wider px-2 pb-1.5 pt-0.5 mb-0.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Starred
                </motion.p>
              )}
              {starredConvs.map(renderCard)}
              {showLabels && (
                <motion.p
                  key="recent-header"
                  layout
                  className={`text-xs font-semibold uppercase tracking-wider px-2 pb-1.5 pt-0.5 mb-0.5 ${starredConvs.length > 0 ? 'mt-2' : ''}`}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Recent
                </motion.p>
              )}
              {recentConvs.map(renderCard)}
              {showLabels && (
                <motion.div key="view-prev" layout className="pt-2 pb-1 px-2">
                  <button
                    className="text-xs w-full text-center py-1.5 rounded-lg transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    View previous chats
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })()}
      </div>

      {/* User footer + popup */}
      <div
        className="shrink-0 border-t relative"
        style={{ borderColor: 'var(--border-subtle)' }}
        ref={userMenuRef}
      >
        {/* User popup menu — opens above */}
        {showUserMenu && (
          <div
            className="absolute bottom-full left-2 right-2 mb-2 rounded-xl shadow-lg border py-1 z-50"
            style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
          >
            <button
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => { setTheme('light'); setShowUserMenu(false); }}
            >
              <Sun size={14} /> Light mode
            </button>
            <button
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => { setTheme('dark'); setShowUserMenu(false); }}
            >
              <Moon size={14} /> Dark mode
            </button>
            <div className="my-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
            <button
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--status-danger)' }}
              onClick={() => { setShowUserMenu(false); setIsSigningOut(true); }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}

        <button
          className="flex items-center gap-3 w-full px-3 py-3 hover:opacity-80 transition-opacity"
          onClick={() => setShowUserMenu(v => !v)}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.initials}
          </div>
          {showLabels && (
            <>
              <div className="min-w-0 text-left flex-1">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.name}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {user.role}
                </div>
              </div>
              <MoreHorizontal size={15} className="shrink-0 opacity-50" style={{ color: 'var(--text-secondary)' }} />
            </>
          )}
        </button>
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="flex h-screen overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--bg-base)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isSigningOut ? 0 : 1 }}
      transition={isSigningOut ? { duration: 0.3, ease: 'easeIn' } : shellEntryTransition}
      onAnimationComplete={() => { if (isSigningOut) { logout(); navigate('/'); } }}
    >

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────────── */}
      <motion.aside
        className={[
          'fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto',
          'flex flex-col overflow-hidden shrink-0',
          'transition-all duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarExpanded ? 'w-60' : 'w-60 lg:w-14',
        ].join(' ')}
        style={{
          backgroundColor: 'var(--surface-1)',
          borderRight: '1px solid var(--border-subtle)',
        }}
        initial={isDesktopViewport ? { x: -16, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={leftPanelEntryTransition}
      >
        {sidebarInner}
      </motion.aside>

      {/* ── RIGHT SECTION (main content area) ───────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">

        {/* Background grid – light */}
        <div
          className="absolute inset-0 pointer-events-none z-0 dark:hidden"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
          }}
        />
        {/* Background grid – dark */}
        <div
          className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
          }}
        />

        {/* Mobile top bar (hidden on lg+) */}
        <div
          className="lg:hidden flex items-center justify-between px-3 shrink-0 relative z-10"
          style={{
            height: '56px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-1)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <FullLogo />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {rightPanelMobile && (
              <button
                onClick={() => setRightOpen(o => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Open context panel"
              >
                <PanelRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Content row: centre + optional right panel */}
        <div className="flex flex-1 overflow-hidden relative z-10">
          <motion.main
            className="flex-1 overflow-hidden min-w-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={contentEntryTransition}
          >
            {children}
          </motion.main>
          {/* Desktop right panel — rendered directly; manages own visibility via CSS */}
          {rightPanel && (
            <motion.div
              className="hidden xl:flex h-full shrink-0"
              initial={isWideDesktopViewport ? { x: 16, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={rightPanelEntryTransition}
            >
              {rightPanel}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile right drawer */}
      <AnimatePresence>
        {rightPanelMobile && rightOpen && (
          <motion.div
            className="xl:hidden fixed inset-y-0 right-0 z-50 w-[22rem] max-w-[85vw] overflow-y-auto"
            style={{
              backgroundColor: 'var(--surface-1)',
              borderLeft: '1px solid var(--border-subtle)',
            }}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {rightPanelMobile(() => setRightOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile right backdrop */}
      {rightOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setRightOpen(false)}
        />
      )}

      <style>{`
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .sidebar-scroll:hover { scrollbar-color: var(--text-secondary) transparent; }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 2px; }
        .sidebar-scroll:hover::-webkit-scrollbar-thumb { background: var(--border-subtle); }
      `}</style>
    </motion.div>
  );
}
