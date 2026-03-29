# User Personas

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    Super Manager                         │
│                     (Reviewer)                          │
│         Reviews appraisals, org-level visibility        │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│      Manager        │         │      Manager        │
│     (Appraiser)     │         │     (Appraiser)     │
│  Approves goals,    │         │  Approves goals,    │
│  leaves, requests   │         │  leaves, requests   │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
     ┌─────┴─────┐                   ┌─────┴─────┐
     ▼           ▼                   ▼           ▼
┌─────────┐ ┌─────────┐         ┌─────────┐ ┌─────────┐
│Employee │ │Employee │         │Employee │ │Employee │
│(Appraisee)│(Appraisee)       │(Appraisee)│(Appraisee)
└─────────┘ └─────────┘         └─────────┘ └─────────┘
```

## Employee Personas

### Corporate/HQ Employee

**Location:** Head office, regional offices

**Primary tasks:**
- Book meeting rooms and video conferences
- Apply for leave and track balance
- Submit claims and benefits requests
- Complete performance cycle (goals → mid-year → annual)
- Access policies and SOPs
- Book travel (flights, trains, accommodation)

**Blu usage:** Daily for quick tasks, periodic for performance/claims

---

### Sales Branch Employee

**Location:** Retail branches, sales offices

**Primary tasks:**
- Book cabs for customer visits
- Submit travel and expense claims
- Check leave balance and apply for leave
- Access branch-specific policies
- Complete performance goals
- View payslips and PF balance

**Context:** Often mobile, needs quick task completion between customer interactions

**Blu usage:** High frequency, short interactions, often on mobile

---

### Dealer Store Employee

**Location:** Electronics and appliances dealer stores

**Primary tasks:**
- Apply for leave
- View payslips and documents
- Access training content on Illume
- Submit claims
- Check public holidays
- Complete compliance declarations

**Context:** Limited desktop access, relies on mobile, may have lower platform familiarity

**Blu usage:** Periodic, needs simple language and guided flows

---

## Manager Personas

### People Manager (Appraiser)

**Role:** Manages team of direct reports

**Primary tasks:**
- Approve/reject leave requests
- Approve employee goals
- Complete mid-year and annual appraisals for team
- Approve claims and benefit requests
- View team attendance and leave calendar
- Give recognition (Kudos/Rejoice)

**Blu usage:** Approvals queue, team status checks, delegation

---

### Senior Manager (Reviewer)

**Role:** Reviews appraisals completed by managers

**Primary tasks:**
- Review and finalize annual appraisals
- Approve escalated requests
- Access team/department reports
- Monitor performance cycle completion

**Blu usage:** Status summaries, escalation handling, deadline tracking

---

## Functional Personas

### HR Partner

**Role:** Human Resources team member

**Primary tasks:**
- Post announcements and news on OPEN Portal
- Upload policy documents
- Handle employee queries (routed from Blu)
- Manage onboarding content
- Monitor compliance completion
- Support performance cycle administration

**Blu context:** Receives escalations when Blu cannot resolve; maintains content Blu references

---

### Platform Admin

**Role:** IT/System administrator

**Primary tasks:**
- Manage user access and permissions (Access 360)
- Configure platform integrations
- Monitor system health and usage
- Handle access-related escalations
- Manage agent configurations

**Blu context:** Configures what Blu can access; handles permission escalations

---

## Role-Based Permissions Summary

| Action | Employee | Manager | Super Manager | HR | Admin |
|--------|----------|---------|---------------|-----|-------|
| Apply for leave | Self | Self | Self | Self | Self |
| Approve leave | — | Direct reports | — | — | — |
| Submit goals | Self | Self | Self | Self | Self |
| Approve goals | — | Direct reports | — | — | — |
| Review appraisals | — | — | Skip-level | — | — |
| Submit claims | Self | Self | Self | Self | Self |
| Approve claims | — | Direct reports | — | — | — |
| Post announcements | — | — | — | Yes | — |
| Upload policies | — | — | — | Yes | — |
| Manage access | — | — | — | — | Yes |
| Configure agent | — | — | — | — | Yes |

## User Volume Distribution

| Persona | Approximate % | Priority |
|---------|---------------|----------|
| Corporate Employee | 40% | P0 |
| Sales Branch Employee | 35% | P0 |
| Dealer Store Employee | 15% | P1 |
| Manager | 8% | P0 |
| Super Manager | 1% | P1 |
| HR Partner | <1% | P1 |
| Platform Admin | <1% | P2 |
