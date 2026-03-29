# Platform Access

## Platforms Overview

| Platform | Type | Primary Users | Use Context |
|----------|------|---------------|-------------|
| Desktop Web | Browser-based | Corporate/HQ employees | Office desks, extended sessions |
| Mobile Web | Browser-based | All employees | Quick access, no app install |
| Mobile App | Native iOS/Android | Field employees, frequent users | On-the-go, offline support |

---

## Desktop Web

### Access Methods

| Method | Description | Implementation |
|--------|-------------|----------------|
| Direct URL | `blu.bajaj.com` | Bookmark or typed URL |
| Corporate Portal | App launcher tile | Integrated into existing employee portal |
| Keyboard Shortcut | `Ctrl+Shift+B` (Windows) | Company laptop policy deployment |
| Desktop Shortcut | Taskbar/Desktop icon | Pre-installed on company laptops |
| Browser Extension | Quick-access popup | Optional install from internal store |

### Company Laptop Integration

| Feature | Detail |
|---------|--------|
| Pre-installed shortcut | Deployed via IT policy to all company laptops |
| Taskbar pin | Blu icon pinned to taskbar by default |
| Start menu entry | Listed under "Company Apps" |
| Keyboard shortcut | `Ctrl+Shift+B` opens Blu in default browser |
| Auto-login | SSO session shared with other Microsoft apps |

### Browser Support

| Browser | Support Level | Notes |
|---------|--------------|-------|
| Microsoft Edge | Primary | Recommended; best SSO integration |
| Chrome | Primary | Full feature support |
| Firefox | Supported | Full feature support |
| Safari | Supported | macOS users |

### Desktop Web Experience

| Aspect | Specification |
|--------|---------------|
| Layout | Chat panel with optional side-by-side workspace |
| Min viewport | 1024px width |
| Optimal viewport | 1280px+ width |
| Responsive | Adapts down to 768px (tablet breakpoint) |
| Session persistence | Stays logged in across browser sessions |

---

## Mobile Web

### Access Methods

| Method | Description |
|--------|-------------|
| Direct URL | `blu.bajaj.com` in mobile browser |
| QR Code | Scan from posters, email signatures, intranet |
| Home screen shortcut | "Add to Home Screen" PWA support |
| Link from emails | Deep links from notifications |

### Progressive Web App (PWA)

| Feature | Support |
|---------|---------|
| Add to Home Screen | Yes (iOS Safari, Android Chrome) |
| Offline indicator | Shows "You're offline" state |
| Push notifications | Supported where browser allows |
| App-like experience | Full-screen mode, no browser chrome |

### Mobile Web Experience

| Aspect | Specification |
|--------|---------------|
| Layout | Full-screen chat, bottom input tray |
| Min viewport | 320px width |
| Optimal viewport | 375px-428px (standard phone widths) |
| Touch targets | Minimum 44x44px tap areas |
| Input | On-screen keyboard with voice option |

### Browser Support (Mobile)

| Browser | Platform | Support |
|---------|----------|---------|
| Safari | iOS | Primary |
| Chrome | Android | Primary |
| Samsung Internet | Android | Supported |
| Edge | iOS/Android | Supported |

---

## Mobile App

### Distribution

| Platform | Store | Availability |
|----------|-------|--------------|
| iOS | Apple App Store | Public (requires corp login) |
| Android | Google Play Store | Public (requires corp login) |
| Android | Internal APK | Sideload for restricted devices |

### App Requirements

| Platform | Minimum Version | Recommended |
|----------|-----------------|-------------|
| iOS | 14.0+ | 16.0+ |
| Android | 10.0+ (API 29) | 12.0+ (API 31) |

### Mobile App Features

| Feature | Detail |
|---------|--------|
| Offline access | View recent conversations; queue new requests |
| Push notifications | Approvals, reminders, status updates |
| Biometric login | Face ID, Touch ID, fingerprint after initial auth |
| Voice input | Native microphone integration |
| Document upload | Camera, gallery, file picker access |
| Deep links | Open directly to specific tasks from notifications |

### Mobile App Experience

| Aspect | Specification |
|--------|---------------|
| Layout | Full-screen chat, floating input |
| Navigation | Bottom nav for Chat, History, Profile |
| Gestures | Swipe to dismiss, pull to refresh |
| Haptics | Feedback on actions, errors |
| Dark mode | Follows system preference |

---

## Authentication

### Identity Provider

| Component | Technology |
|-----------|------------|
| SSO Provider | Microsoft Entra ID (Azure AD) |
| Account type | Corporate Microsoft 365 account |
| MFA | Microsoft Authenticator app |

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Opens Blu                        │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Existing Session?    │
              └───────────┬───────────┘
                    │           │
                   Yes          No
                    │           │
                    ▼           ▼
            ┌───────────┐  ┌────────────────┐
            │  Auto     │  │ Microsoft      │
            │  Login    │  │ Login Page     │
            └───────────┘  └───────┬────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │ Enter Corp     │
                          │ Email/Password │
                          └───────┬────────┘
                                  │
                                  ▼
                          ┌────────────────┐
                          │ Microsoft      │
                          │ Authenticator  │
                          │ MFA Prompt     │
                          └───────┬────────┘
                                  │
                                  ▼
                          ┌────────────────┐
                          │ Authenticated  │
                          │ → Enter Blu    │
                          └────────────────┘
```

### Session Management

| Aspect | Desktop Web | Mobile Web | Mobile App |
|--------|-------------|------------|------------|
| Session duration | 8 hours active, 24 hours idle | 8 hours active, 24 hours idle | 30 days |
| Re-auth trigger | Session expiry, sensitive action | Session expiry, sensitive action | App reinstall, 30-day expiry |
| Remember device | Yes (trusted device) | Yes (trusted browser) | Yes (biometric unlock) |
| Concurrent sessions | Allowed across devices | Allowed | Allowed |

### Sensitive Action Re-authentication

| Action | Requires MFA |
|--------|--------------|
| View payslip | No |
| Download documents | No |
| Submit leave request | No |
| Change bank details | Yes |
| Update personal info | Yes |
| Access tax documents | Yes |

---

## Entry Points

### Discovery Entry Points

| Entry Point | Platform | Description |
|-------------|----------|-------------|
| Corporate portal tile | Desktop Web | App launcher on intranet homepage |
| Taskbar icon | Desktop Web | Pre-installed on company laptops |
| Keyboard shortcut | Desktop Web | `Ctrl+Shift+B` opens Blu |
| Home screen icon | Mobile App/PWA | App icon on phone |
| QR codes | Mobile | Posters in office, email signatures |

### In-Workflow Entry Points

| Entry Point | Platform | Description |
|-------------|----------|-------------|
| Microsoft Teams bot | Desktop/Mobile | `@Blu` mention in Teams |
| Outlook add-in | Desktop Web | Sidebar in email client |
| Email deep links | All | Links in notification emails |
| Push notifications | Mobile App | Tap to open specific task |
| Widget | Mobile App | Home screen widget for quick access |

### Contextual Entry Points

| Entry Point | Context Passed |
|-------------|----------------|
| From HR portal | Current page, pending actions |
| From Chroma | User profile, leave context |
| From notification | Task type, action required |
| From Teams message | Conversation context |
| From Google search | Search keyword (if internal result) |

---

## Deep Linking

### URL Structure

```
blu.bajaj.com/action/{action-type}?params
```

### Supported Deep Links

| Action | URL Pattern | Example |
|--------|-------------|---------|
| Open chat | `/chat` | `blu.bajaj.com/chat` |
| Start task | `/action/{task}` | `blu.bajaj.com/action/apply-leave` |
| View status | `/status/{request-id}` | `blu.bajaj.com/status/REQ123` |
| Open session | `/session/{session-id}` | `blu.bajaj.com/session/abc123` |

### Deep Link Behavior

| Scenario | Behavior |
|----------|----------|
| User authenticated | Open directly to target |
| User not authenticated | Auth → redirect to target |
| Invalid/expired link | Show error with recovery options |
| Mobile app installed | Open in app (universal links) |
| Mobile app not installed | Open in mobile web |

---

## Cross-Platform Continuity

### Sync Behavior

| Data | Sync Scope |
|------|------------|
| Conversation history | All platforms, real-time |
| Pending tasks | All platforms, real-time |
| User preferences | All platforms, on login |
| Draft messages | Same device only |

### Handoff Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Start on desktop, continue on mobile | Full context available |
| Start in Teams, view full history in web | Seamless transition |
| Receive notification on phone, complete on desktop | Task context synced |
| Offline action on mobile, go online on desktop | Queued action syncs |

---

## Network Requirements

| Requirement | Specification |
|-------------|---------------|
| Minimum bandwidth | 256 Kbps |
| Recommended bandwidth | 1 Mbps+ |
| Latency tolerance | <500ms for good experience |
| Offline support | Mobile app only (limited) |
| VPN required | No (accessible on public internet with auth) |

---

## Backend Integrations

### Connected Systems

| System | Integration | Data Access |
|--------|-------------|-------------|
| Employee Services Portal | API | Meeting rooms, travel, cabs |
| Employee 360 | API | Tasks, performance, HR contact |
| Chroma (HRMS) | API | Profile, leave, claims, payslips |
| OPEN Portal | API | Feed, announcements, gallery |
| Quick Access Panel | API | Finance, benefits, wellness |
| Illume | API | Learning content, tutorials |
| Microsoft Graph | API | Calendar, email context |

### Integration Pattern

```
┌─────────────────────────────────────────────────────────┐
│                     Blu Frontend                         │
│         (Desktop Web / Mobile Web / Mobile App)          │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Blu API Gateway                      │
│            (Auth, Rate Limiting, Routing)                │
└─────────────────────────┬───────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Agent Core │   │  User Data  │   │  Session    │
│  (LLM)      │   │  Service    │   │  Service    │
└──────┬──────┘   └──────┬──────┘   └─────────────┘
       │                 │
       ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│              Enterprise System Connectors                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Chroma  │ │  E360   │ │  OPEN   │ │ Illume  │ ...   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────┘
```
