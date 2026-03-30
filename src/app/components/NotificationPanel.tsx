import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from 'next-themes';
import {
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  ShieldAlert,
  X,
} from 'lucide-react';

type NotificationGroup = 'action' | 'blocked' | 'time' | 'progress' | 'fyi';
type Severity = 'low' | 'medium' | 'high';
type NotificationFilter = 'all' | 'unread';
type BadgeTone = 'urgent' | 'moderate' | 'status' | 'fyi';

type NotificationItem =
  | {
      id: string;
      group: NotificationGroup;
      layout: 'A';
      title: string;
      status: string;
      progress: number;
      nextStep: string;
      timestamp: string;
    }
  | {
      id: string;
      group: NotificationGroup;
      layout: 'B';
      title: string;
      steps: string[];
      currentStep: number;
      stuckStep?: number;
      timeInStage?: string;
      timestamp: string;
    }
  | {
      id: string;
      group: NotificationGroup;
      layout: 'C';
      title: string;
      requester: string;
      summary: string;
      details: string[];
      actions?: string[];
      timestamp: string;
    }
  | {
      id: string;
      group: NotificationGroup;
      layout: 'D';
      title: string;
      summary: string;
      primaryAction: string;
      secondaryAction: string;
      tertiaryAction: string;
      timestamp: string;
    }
  | {
      id: string;
      group: NotificationGroup;
      layout: 'E';
      title: string;
      description: string;
      countdown: string;
      severity: Severity;
      timestamp: string;
    }
  | {
      id: string;
      group: NotificationGroup;
      layout: 'F';
      title: string;
      description: string;
      timestamp: string;
      viewLabel?: string;
    };

interface NotificationPanelProps {
  profile: 'dms' | 'b2b' | 'hr' | 'corporate';
  className?: string;
  desktopWidthClass?: string;
}

const BRAND_BLUE = '#3F51B5';
const PANEL_BG_LIGHT = '#F5F5F7';
const PANEL_BG_DARK = '#18181B';
const FILTERS: NotificationFilter[] = ['all', 'unread'];

const PROFILE_NOTIFICATIONS: Record<NotificationPanelProps['profile'], NotificationItem[]> = {
  corporate: [],
  dms: [
    {
      id: 'dms-c-1',
      group: 'action',
      layout: 'C',
      title: 'Document Needs Signature',
      requester: 'Compliance Team',
      summary: 'KYC addendum for Dealer #4928 is pending your sign-off.',
      details: ['Reason: PAN mismatch correction', 'Impact: Settlement hold if delayed', 'SLA: Sign within 6 hours'],
      timestamp: '5m ago',
    },
    {
      id: 'dms-d-1',
      group: 'action',
      layout: 'D',
      title: 'Dealer Credit Limit Request',
      summary: 'Dealer #4928 requests credit increase of ₹2,00,000 for month-end dispatches.',
      primaryAction: 'Approve',
      secondaryAction: 'Query',
      tertiaryAction: 'Escalate',
      timestamp: '12m ago',
    },
    {
      id: 'dms-b-1',
      group: 'blocked',
      layout: 'B',
      title: 'Ticket #4921 Approval Chain',
      steps: ['Submitted', 'Under Review', 'Awaiting L2 Approval', 'Resolved'],
      currentStep: 2,
      stuckStep: 2,
      timeInStage: 'Stuck for 2h 10m',
      timestamp: '18m ago',
    },
    {
      id: 'dms-e-1',
      group: 'time',
      layout: 'E',
      title: 'SLA Breach Risk',
      description: '3 active dealer cases may breach response SLA.',
      countdown: '1h 45m left',
      severity: 'high',
      timestamp: 'Now',
    },
    {
      id: 'dms-e-2',
      group: 'time',
      layout: 'E',
      title: 'KYC Compliance Expiry',
      description: 'Dealer #2861 KYC packet expires soon.',
      countdown: '9h 20m left',
      severity: 'medium',
      timestamp: '7m ago',
    },
    {
      id: 'dms-a-1',
      group: 'progress',
      layout: 'A',
      title: 'Ticket Approval Progress',
      status: 'In Review',
      progress: 60,
      nextStep: 'Awaiting L2 Approval',
      timestamp: '8m ago',
    },
    {
      id: 'dms-f-1',
      group: 'fyi',
      layout: 'F',
      title: 'IMPS Gateway Maintenance',
      description: 'Scheduled maintenance tonight, 11:00 PM - 1:00 AM.',
      timestamp: '1h ago',
      viewLabel: 'View schedule',
    },
  ],
  b2b: [
    {
      id: 'b2b-c-1',
      group: 'action',
      layout: 'C',
      title: 'Expense Claim Approval',
      requester: 'Ajay Verma',
      summary: 'Travel expense claim of ₹3,200 needs your approval.',
      details: ['Trip: Pune → Nashik'],
      actions: ['Approve', 'Reject', 'Request details'],
      timestamp: '4m ago',
    },
    {
      id: 'b2b-c-2',
      group: 'action',
      layout: 'C',
      title: 'Leave Approval Request',
      requester: 'Rakesh Kulkarni',
      summary: 'Casual leave request for 29 Mar submitted by Rakesh Kulkarni.',
      details: [],
      actions: ['Approve', 'Reject'],
      timestamp: '10m ago',
    },
    {
      id: 'b2b-a-1',
      group: 'progress',
      layout: 'A',
      title: 'Leave Request Submitted',
      status: 'Pending approval',
      progress: 25,
      nextStep: 'Awaiting manager approval',
      timestamp: '15m ago',
    },
    {
      id: 'b2b-c-3',
      group: 'action',
      layout: 'C',
      title: 'Claim Requires Clarification',
      requester: 'Finance Team',
      summary: 'Fuel claim needs additional receipt upload to proceed.',
      details: [],
      actions: ['Attach Receipt'],
      timestamp: '20m ago',
    },
    {
      id: 'b2b-e-1',
      group: 'time',
      layout: 'E',
      title: 'Mandatory Survey Pending',
      description: 'Employee Engagement Survey. Estimated time: 5 mins.',
      countdown: 'Due today',
      severity: 'medium',
      timestamp: 'Now',
    },
    {
      id: 'b2b-f-1',
      group: 'fyi',
      layout: 'F',
      title: 'DO Cancelled Successfully',
      description: 'You cancelled the DO for LAN: XX123456.',
      timestamp: '30m ago',
    },
  ],
  hr: [
    {
      id: 'hr-c-1',
      group: 'action',
      layout: 'C',
      title: 'Leave Request from Reportee',
      requester: 'Priya Nair',
      summary: '2 days leave request for Mar 27-28 is awaiting your decision.',
      details: ['Reason: Family event', 'Leave balance after approval: 8 days', 'Team coverage: Available'],
      timestamp: '3m ago',
    },
    {
      id: 'hr-c-2',
      group: 'action',
      layout: 'C',
      title: 'Expense Claim Approval',
      requester: 'Amit Deshmukh',
      summary: 'Expense claim of ₹5,900 submitted for approval.',
      details: ['Category: Candidate travel', 'Receipts: Attached', 'Finance SLA: 24 hours'],
      timestamp: '15m ago',
    },
    {
      id: 'hr-b-1',
      group: 'blocked',
      layout: 'B',
      title: 'New Joiner Onboarding',
      steps: ['Submitted', 'Under Review', 'Awaiting IT Access', 'Resolved'],
      currentStep: 2,
      stuckStep: 2,
      timeInStage: 'Stuck for 3h 05m',
      timestamp: '27m ago',
    },
    {
      id: 'hr-e-1',
      group: 'time',
      layout: 'E',
      title: 'Probation Review Due',
      description: 'Probation review for 2 employees is approaching deadline.',
      countdown: '3h 30m left',
      severity: 'high',
      timestamp: 'Now',
    },
    {
      id: 'hr-a-1',
      group: 'progress',
      layout: 'A',
      title: 'Ticket Approval Progress',
      status: 'In Review',
      progress: 55,
      nextStep: 'Awaiting HRBP confirmation',
      timestamp: '10m ago',
    },
    {
      id: 'hr-f-1',
      group: 'fyi',
      layout: 'F',
      title: 'Policy Update to Review',
      description: 'Leave carry-forward policy v3.2 is published for acknowledgement.',
      timestamp: '1h ago',
      viewLabel: 'Review policy',
    },
    {
      id: 'hr-f-2',
      group: 'fyi',
      layout: 'F',
      title: 'System Maintenance',
      description: 'Employee portal maintenance tonight, 11:00 PM - 1:00 AM.',
      timestamp: '2h ago',
    },
  ],
};

const GROUP_STYLES: Record<
  NotificationGroup,
  {
    accent: string;
    softBackground: string;
    iconColor: string;
    icon: typeof FileCheck2;
  }
> = {
  action: {
    accent: '#DC2626',
    softBackground: 'rgba(220, 38, 38, 0.12)',
    iconColor: '#B91C1C',
    icon: FileCheck2,
  },
  blocked: {
    accent: '#D97706',
    softBackground: 'rgba(217, 119, 6, 0.14)',
    iconColor: '#B45309',
    icon: ShieldAlert,
  },
  time: {
    accent: '#EA580C',
    softBackground: 'rgba(234, 88, 12, 0.14)',
    iconColor: '#C2410C',
    icon: Clock3,
  },
  progress: {
    accent: BRAND_BLUE,
    softBackground: 'rgba(63, 81, 181, 0.12)',
    iconColor: BRAND_BLUE,
    icon: CircleAlert,
  },
  fyi: {
    accent: '#9CA3AF',
    softBackground: 'rgba(156, 163, 175, 0.18)',
    iconColor: '#6B7280',
    icon: FileText,
  },
};

function parseRelativeTimestamp(timestamp: string) {
  const normalized = timestamp.trim().toLowerCase();

  if (normalized === 'now') {
    return 0;
  }

  const days = Number(normalized.match(/(\d+)d/)?.[1] ?? 0);
  const hours = Number(normalized.match(/(\d+)h/)?.[1] ?? 0);
  const minutes = Number(normalized.match(/(\d+)m/)?.[1] ?? 0);
  const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;

  return totalMinutes || Number.MAX_SAFE_INTEGER;
}

function getNotificationSummary(item: NotificationItem) {
  if (item.layout === 'A') {
    return `${item.nextStep}. ${item.progress}% complete.`;
  }

  if (item.layout === 'B') {
    return `${item.steps[item.currentStep] ?? 'Current step'} is waiting for movement in the workflow.`;
  }

  if (item.layout === 'C' || item.layout === 'D') {
    return item.summary;
  }

  return item.description;
}

function getBadgeConfig(item: NotificationItem): { label: string; tone: BadgeTone } {
  if (item.layout === 'A') {
    return { label: item.status, tone: 'status' };
  }

  if (item.layout === 'B') {
    return { label: 'Blocked', tone: 'moderate' };
  }

  if (item.layout === 'C') {
    return { label: 'Needs action', tone: 'urgent' };
  }

  if (item.layout === 'D') {
    return { label: 'Decision due', tone: 'urgent' };
  }

  if (item.layout === 'E') {
    return {
      label: item.countdown,
      tone: item.severity === 'high' ? 'urgent' : item.severity === 'medium' ? 'moderate' : 'status',
    };
  }

  return { label: 'FYI', tone: 'fyi' };
}

function getBadgeStyles(tone: BadgeTone, isDark: boolean) {
  if (tone === 'urgent') {
    return isDark
      ? { backgroundColor: 'rgba(185,28,28,0.28)', color: '#FCA5A5' }
      : { backgroundColor: '#FEE2E2', color: '#B91C1C' };
  }
  if (tone === 'moderate') {
    return isDark
      ? { backgroundColor: 'rgba(146,64,14,0.28)', color: '#FCD34D' }
      : { backgroundColor: '#FEF3C7', color: '#92400E' };
  }
  if (tone === 'status') {
    return isDark
      ? { backgroundColor: 'rgba(55,48,163,0.35)', color: '#A5B4FC' }
      : { backgroundColor: '#E0E7FF', color: '#3730A3' };
  }
  return isDark
    ? { backgroundColor: '#3F3F46', color: '#A1A1AA' }
    : { backgroundColor: '#E5E7EB', color: '#4B5563' };
}

function getActionLabels(item: NotificationItem) {
  if (item.layout === 'C') {
    return item.actions ?? ['Approve', 'Decline', 'Details'];
  }

  if (item.layout === 'D') {
    return [item.primaryAction, item.secondaryAction, item.tertiaryAction];
  }

  return [];
}

function filterLabel(filter: NotificationFilter) {
  if (filter === 'all') return 'All';
  return 'Unread';
}

function StepTracker({
  steps,
  currentStep,
  stuckStep,
  accent,
}: {
  steps: string[];
  currentStep: number;
  stuckStep?: number;
  accent: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const inactiveBg    = isDark ? '#27272A' : '#FFFFFF';
  const inactiveBorder= isDark ? '#52525B' : '#D1D5DB';
  const inactiveColor = isDark ? '#9CA3AF' : '#6B7280';
  const stuckBg       = isDark ? 'rgba(180,83,9,0.28)' : '#FEF3C7';
  const stuckColor    = isDark ? '#FCD34D' : '#B45309';
  const activeBg      = isDark ? 'rgba(55,48,163,0.28)' : '#EEF2FF';
  const connectorDim  = isDark ? '#3F3F46' : '#D1D5DB';
  const labelColor    = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-start gap-2">
        {steps.map((step, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;
          const stuck = stuckStep === index;

          return (
            <React.Fragment key={`${step}-${index}`}>
              <div className="flex w-16 flex-col items-center gap-1.5 text-center">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold"
                  style={{
                    backgroundColor: completed ? accent : stuck ? stuckBg : active ? activeBg : inactiveBg,
                    borderColor: completed ? accent : stuck ? '#F59E0B' : active ? accent : inactiveBorder,
                    color: completed ? '#FFFFFF' : stuck ? stuckColor : active ? accent : inactiveColor,
                  }}
                >
                  {completed ? <Check size={12} /> : index + 1}
                </div>
                <span className="text-[10px] leading-tight" style={{ color: labelColor }}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="mt-3 h-px w-6 shrink-0"
                  style={{ backgroundColor: completed ? accent : connectorDim }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ExpandedNotificationContent({ item }: { item: NotificationItem }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const appearance = GROUP_STYLES[item.group];
  const actions = getActionLabels(item);

  const chipBg     = isDark ? '#27272A' : '#F8FAFC';
  const chipText   = isDark ? '#A1A1AA' : '#555555';
  const btnSecBg   = isDark ? '#27272A' : '#FFFFFF';
  const btnSecBdr  = isDark ? '#52525B' : '#D1D5DB';
  const btnSecText = isDark ? '#A1A1AA' : '#4B5563';
  const warnBg     = isDark ? 'rgba(124,45,18,0.22)' : '#FFF7ED';
  const warnLabel  = isDark ? '#FB923C' : '#9A3412';
  const warnValue  = isDark ? '#FED7AA' : '#7C2D12';
  const trackBg    = isDark ? '#3F3F46' : '#E5E7EB';
  const metaText   = isDark ? '#9CA3AF' : '#666666';
  const metaBold   = isDark ? '#E4E4E7' : '#333333';
  const descText   = isDark ? '#A1A1AA' : '#555555';
  const viewBtnBg  = isDark ? '#27272A' : '#FFFFFF';

  if (item.layout === 'A') {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: trackBg }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${item.progress}%`, backgroundColor: appearance.accent }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px]" style={{ color: metaText }}>
            <span>{item.nextStep}</span>
            <span className="font-semibold" style={{ color: metaBold }}>{item.progress}%</span>
          </div>
        </div>
      </div>
    );
  }

  if (item.layout === 'B') {
    return (
      <div className="space-y-3">
        <StepTracker
          steps={item.steps}
          currentStep={item.currentStep}
          stuckStep={item.stuckStep}
          accent={appearance.accent}
        />
        {item.timeInStage && (
          <div
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-medium"
            style={{ backgroundColor: warnBg, color: warnLabel }}
          >
            {item.timeInStage}
          </div>
        )}
      </div>
    );
  }

  if (item.layout === 'C') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: chipBg, color: chipText }}>
          Requested by {item.requester}
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max flex-nowrap gap-2">
            {actions.map((action, index) => (
              <button
                key={action}
                type="button"
                className="h-8 shrink-0 whitespace-nowrap rounded-full px-[14px] text-xs font-medium"
                style={{
                  backgroundColor: index === 0 ? BRAND_BLUE : btnSecBg,
                  border: `1px solid ${index === 0 ? BRAND_BLUE : btnSecBdr}`,
                  color: index === 0 ? '#FFFFFF' : btnSecText,
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {item.details.map((detail) => (
            <div key={detail} className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: chipBg, color: chipText }}>
              {detail}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.layout === 'D') {
    return (
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max flex-nowrap gap-2">
          {actions.map((action, index) => (
            <button
              key={action}
              type="button"
              className="h-8 shrink-0 whitespace-nowrap rounded-full px-[14px] text-xs font-medium"
              style={{
                backgroundColor: index === 0 ? BRAND_BLUE : btnSecBg,
                border: `1px solid ${index === 0 ? BRAND_BLUE : btnSecBdr}`,
                color: index === 0 ? '#FFFFFF' : btnSecText,
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (item.layout === 'E') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg px-3 py-2" style={{ backgroundColor: warnBg }}>
          <div className="text-[10px] uppercase tracking-[0.2px]" style={{ color: warnLabel }}>Countdown</div>
          <div className="mt-1 text-xs font-semibold" style={{ color: warnValue }}>{item.countdown}</div>
        </div>
        <div className="rounded-lg px-3 py-2" style={{ backgroundColor: warnBg }}>
          <div className="text-[10px] uppercase tracking-[0.2px]" style={{ color: warnLabel }}>Severity</div>
          <div className="mt-1 text-xs font-semibold capitalize" style={{ color: warnValue }}>{item.severity}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-5" style={{ color: descText }}>{item.description}</p>
      {item.viewLabel && (
        <button
          type="button"
          className="h-8 rounded-full px-[14px] text-xs font-medium"
          style={{ backgroundColor: viewBtnBg, border: `1px solid ${BRAND_BLUE}`, color: BRAND_BLUE }}
        >
          {item.viewLabel}
        </button>
      )}
    </div>
  );
}

function NotificationCard({
  item,
  expanded,
  unread,
  highlighted,
  onToggleExpanded,
  onDismiss,
  onSnooze,
  onHighlight,
}: {
  item: NotificationItem;
  expanded: boolean;
  unread: boolean;
  highlighted: boolean;
  onToggleExpanded: (id: string) => void;
  onDismiss: (id: string) => void;
  onSnooze: (id: string) => void;
  onHighlight: (id: string) => void;
}) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const appearance = GROUP_STYLES[item.group];
  const badge = getBadgeConfig(item);
  const Icon = appearance.icon;
  const description = getNotificationSummary(item);

  const cardBg         = isDark ? (highlighted ? '#1e2849' : '#27272A') : (highlighted ? '#F0F4FF' : '#FFFFFF');
  const cardBorder     = isDark ? '#3F3F46' : '#EBEBEB';
  const titleColor     = isDark ? '#F9FAFB' : '#1F2937';
  const descColor      = isDark ? '#A1A1AA' : '#555555';
  const timestampColor = isDark ? '#71717A' : '#9E9E9E';
  const chevronBorder  = isDark ? '#52525B' : '#D8DCE8';
  const chevronColor   = isDark ? '#9CA3AF' : '#697386';
  const dividerColor   = isDark ? '#3F3F46' : '#EBEBEB';

  return (
    <article
      className="overflow-hidden rounded-[12px] border transition-colors duration-200"
      style={{
        backgroundColor: cardBg,
        borderColor: cardBorder,
      }}
      onPointerDown={() => onHighlight(item.id)}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const touchStart = touchStartRef.current;
        const touch = event.changedTouches[0];

        if (!touchStart || !touch) {
          return;
        }

        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;

        if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            onDismiss(item.id);
          } else {
            onSnooze(item.id);
          }
        }

        touchStartRef.current = null;
      }}
    >
      <div className="min-h-[88px] p-4">
        <div className="flex items-start gap-[10px]">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: appearance.softBackground, color: appearance.iconColor }}
          >
            <Icon size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {unread && !expanded && (
                    <span
                      className="block h-[6px] w-[6px] rounded-full shrink-0"
                      style={{ backgroundColor: BRAND_BLUE }}
                      aria-hidden="true"
                    />
                  )}
                  <h3
                    className="min-w-0 truncate"
                    style={{ color: titleColor, fontSize: 14, lineHeight: '20px', fontWeight: 600 }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p
                  className="mt-1 overflow-hidden text-ellipsis"
                  style={{
                    color: descColor,
                    fontSize: 13,
                    lineHeight: '18px',
                    fontWeight: 400,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {description}
                </p>
              </div>

              <span
                className="shrink-0 rounded-full"
                style={{
                  ...getBadgeStyles(badge.tone, isDark),
                  minWidth: 64,
                  padding: '4px 8px',
                  fontSize: 10,
                  lineHeight: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {badge.label}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span style={{ color: timestampColor, fontSize: 11, lineHeight: '14px', fontWeight: 400 }}>
                {item.timestamp}
              </span>

              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full border transition-transform duration-200 ease-in-out"
                style={{
                  borderColor: chevronBorder,
                  color: chevronColor,
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                onClick={() => onToggleExpanded(item.id)}
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse notification details' : 'Expand notification details'}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: dividerColor }}>
              <ExpandedNotificationContent item={item} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function NotificationPanelContent({
  profile,
  onClosePanel,
  closeMode,
}: {
  profile: NotificationPanelProps['profile'];
  onClosePanel?: () => void;
  closeMode?: 'desktop' | 'mobile';
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const notifications = PROFILE_NOTIFICATIONS[profile];
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const [snoozedIds, setSnoozedIds] = useState<Set<string>>(() => new Set());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  const sortedNotifications = useMemo(() => {
    return notifications
      .map((item, index) => ({ item, index }))
      .sort((left, right) => {
        const timestampDiff = parseRelativeTimestamp(left.item.timestamp) - parseRelativeTimestamp(right.item.timestamp);
        return timestampDiff !== 0 ? timestampDiff : left.index - right.index;
      })
      .map(({ item }) => item);
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    return sortedNotifications
      .filter((item) => !dismissedIds.has(item.id) && !snoozedIds.has(item.id))
      .filter((item) => {
        if (activeFilter === 'all') {
          return true;
        }

        return !readIds.has(item.id) || expandedIds.has(item.id);
      });
  }, [activeFilter, dismissedIds, expandedIds, readIds, snoozedIds, sortedNotifications]);

  const allRead = notifications.every((item) => readIds.has(item.id));

  const handleToggleExpanded = (id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

    setReadIds((previous) => {
      if (previous.has(id)) {
        return previous;
      }

      const next = new Set(previous);
      next.add(id);
      return next;
    });
  };

  const handleMarkAllAsRead = () => {
    setReadIds(new Set(notifications.map((item) => item.id)));
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((previous) => new Set(previous).add(id));
    setExpandedIds((previous) => {
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  };

  const handleSnooze = (id: string) => {
    setSnoozedIds((previous) => new Set(previous).add(id));
    setExpandedIds((previous) => {
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  };

  const handleHighlight = (id: string) => {
    setHighlightedId(id);

    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedId((current) => (current === id ? null : current));
    }, 220);
  };

  const panelBg      = isDark ? PANEL_BG_DARK : PANEL_BG_LIGHT;
  const headerBg     = isDark ? 'rgba(24,24,27,0.96)' : 'rgba(245,245,247,0.96)';
  const headerBorder = isDark ? '#3F3F46' : '#E6E6EA';
  const iconColor    = isDark ? '#9CA3AF' : '#4B5563';
  const titleColor   = isDark ? '#F9FAFB' : '#1F2937';
  const btnBorder    = isDark ? '#52525B' : '#D8DCE8';
  const btnColor     = isDark ? '#9CA3AF' : '#697386';
  const btnBg        = isDark ? '#27272A' : '#FFFFFF';
  const filterUnselBg  = isDark ? '#3F3F46' : '#FFFFFF';
  const filterUnselBdr = isDark ? '#52525B' : '#D8DCE8';
  const filterUnselTxt = isDark ? '#A1A1AA' : '#4B5563';
  const emptyIconBg  = isDark ? 'rgba(37,99,235,0.22)' : '#E8ECFB';
  const emptyText    = isDark ? '#9CA3AF' : '#4B5563';

  return (
    <div className="flex h-full min-h-0 w-full flex-col" style={{ backgroundColor: panelBg }}>
      <div
        className="sticky top-0 z-10 border-b px-4 py-4 backdrop-blur"
        style={{ borderColor: headerBorder, backgroundColor: headerBg }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Bell size={16} style={{ color: iconColor }} />
            <h2 className="text-sm font-semibold" style={{ color: titleColor }}>
              Notifications
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="text-xs font-medium transition-opacity"
              style={{ color: allRead ? '#9CA3AF' : BRAND_BLUE }}
              onClick={handleMarkAllAsRead}
              disabled={allRead}
            >
              Mark all as read
            </button>

            {onClosePanel && closeMode === 'desktop' && (
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border"
                style={{ borderColor: btnBorder, color: btnColor, backgroundColor: btnBg }}
                onClick={onClosePanel}
                aria-label="Collapse notifications panel"
              >
                <PanelRightClose size={14} />
              </button>
            )}

            {onClosePanel && closeMode === 'mobile' && (
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border"
                style={{ borderColor: btnBorder, color: btnColor, backgroundColor: btnBg }}
                onClick={onClosePanel}
                aria-label="Close notifications panel"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-0.5">
          {FILTERS.map((filter) => {
            const selected = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: selected ? BRAND_BLUE : filterUnselBg,
                  color: selected ? '#FFFFFF' : filterUnselTxt,
                  border: `1px solid ${selected ? BRAND_BLUE : filterUnselBdr}`,
                }}
                onClick={() => setActiveFilter(filter)}
                aria-pressed={selected}
              >
                {filterLabel(filter)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {visibleNotifications.length > 0 ? (
          <div className="space-y-3">
            {visibleNotifications.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                expanded={expandedIds.has(item.id)}
                unread={!readIds.has(item.id)}
                highlighted={highlightedId === item.id}
                onToggleExpanded={handleToggleExpanded}
                onDismiss={handleDismiss}
                onSnooze={handleSnooze}
                onHighlight={handleHighlight}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[280px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: emptyIconBg, color: BRAND_BLUE }}
              >
                <Bell size={22} />
              </div>
              <p className="text-sm font-medium" style={{ color: emptyText }}>
                You&apos;re all caught up
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function NotificationPanel({
  profile,
  className = '',
  desktopWidthClass = 'w-[22rem]',
}: NotificationPanelProps) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const panelBg     = isDark ? PANEL_BG_DARK : PANEL_BG_LIGHT;
  const collBtnBg   = isDark ? '#27272A' : '#FFFFFF';
  const collBtnBdr  = isDark ? '#52525B' : '#D8DCE8';
  const collBtnClr  = isDark ? '#9CA3AF' : '#697386';

  return (
    <div
      className={`hidden xl:flex shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
        desktopOpen ? desktopWidthClass : 'w-12'
      } ${className}`}
      style={{ backgroundColor: panelBg }}
    >
      {desktopOpen ? (
        <NotificationPanelContent
          profile={profile}
          onClosePanel={() => setDesktopOpen(false)}
          closeMode="desktop"
        />
      ) : (
        <div className="flex w-full items-start justify-center pt-4" style={{ backgroundColor: panelBg }}>
          <button
            type="button"
            onClick={() => setDesktopOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{ borderColor: collBtnBdr, color: collBtnClr, backgroundColor: collBtnBg }}
            aria-label="Open notifications panel"
          >
            <PanelRightOpen size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export function NotificationMobilePanel({
  profile,
  onClose,
}: {
  profile: NotificationPanelProps['profile'];
  onClose?: () => void;
}) {
  return <NotificationPanelContent profile={profile} onClosePanel={onClose} closeMode="mobile" />;
}
