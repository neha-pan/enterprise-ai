# Platform Overview

## Vision

A single conversational interface that unifies fragmented enterprise systems, enabling employees to complete tasks through natural language instead of navigating multiple platforms.

## Problem Statement

### Core Problem: Platform Fragmentation

Employees currently navigate **7+ disconnected platforms** to complete daily tasks:

| Platform | Primary Functions |
|----------|-------------------|
| Employee Services Portal | Office management, meeting rooms, travel booking, cab booking |
| Employee 360 | Tasks, HR contact, performance management |
| OPEN Portal | Team info, feeds, internal marketplace |
| Chroma (HRMS) | Profile, payslips, leave, claims, documents |
| Quick Access Panel | Finance, benefits, wellness, recognition |
| Illume | Learning and upskilling |
| Other Apps | PMS, policies, podcasts, social |

### Impact

- **Context switching** — Employees lose time determining which platform handles which task
- **Duplicate functionality** — Same tasks (e.g., cab booking, travel) exist across multiple platforms
- **Cognitive load** — Remembering where things live becomes a task itself
- **Abandoned tasks** — Friction causes employees to delay or skip non-urgent actions

## Solution: Chat-First Agent

Blu serves as a **unified conversational layer** across all platforms. Instead of navigating to the right system, employees describe what they need.

**Example interactions:**
- "Book a cab for tomorrow 8 AM" → Routes to appropriate booking system
- "What's my leave balance?" → Fetches from Chroma
- "Take me to my PF balance" → Deep links to Quick Access Panel
- "How do I submit a claim?" → Surfaces policy + guides through process

## Scope

### High-Priority Tasks (Phase 1)

Tasks selected based on frequency, fragmentation, and impact:

| Task Category | Why Prioritize |
|---------------|----------------|
| **Travel & Cab Booking** | Appears in 3+ platforms; high daily volume |
| **Leave & Attendance** | Universal need; currently buried in Chroma |
| **Performance Cycle** | Time-sensitive; employees miss deadlines |
| **Policy Lookups** | Scattered across portals; hard to find |
| **Quick Navigation** | "Take me to X" eliminates platform hunting |
| **Claims & Benefits** | Multi-step process; high abandonment |

### What Blu Does

- Understands natural language requests
- Routes to correct underlying system
- Executes tasks on behalf of employees (with confirmation)
- Surfaces relevant information proactively
- Provides deep links when direct action isn't possible

### What Blu Does Not Do

- Replace underlying platforms (they remain source of truth)
- Make decisions without employee confirmation
- Access data beyond employee's permissions
- Handle tasks requiring human judgment (escalates to HR/manager)

## Platform Landscape

```
┌─────────────────────────────────────────────────────────┐
│                         Blu                             │
│              (Conversational Interface)                 │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Employee    │ │    Chroma     │ │     Quick     │
│   Services    │ │    (HRMS)     │ │    Access     │
└───────────────┘ └───────────────┘ └───────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Employee 360 │ │     OPEN      │ │    Illume     │
│               │ │    Portal     │ │  (Learning)   │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Success Definition

Blu succeeds when employees:
- Default to asking Blu before hunting for the right platform
- Complete high-frequency tasks faster than current state
- No longer need to remember which system does what
