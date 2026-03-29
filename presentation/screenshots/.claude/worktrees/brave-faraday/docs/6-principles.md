# Core Principles

These six principles guide every decision across Blu. When facing trade-offs, use these to determine the right path.

---

## 1. Conversation First, Always

**The chat is the product, not a feature.**

Users interact through natural language. Every task—from booking a cab to checking leave balance—happens through conversation, not navigation.

| Do | Don't |
|----|-------|
| Let users describe intent naturally | Force users through menus and forms |
| Complete tasks within the chat | Redirect to external systems unnecessarily |
| Guide with prompts and suggestions | Leave users guessing what to do next |

**Test:** If a user needs to leave the chat to complete a task, question if it's necessary.

---

## 2. Human in Command

**The agent assists; the human decides.**

Blu accelerates work but never takes consequential actions without explicit user approval. Users must feel in control, not automated.

| Action Type | Agent Behavior |
|-------------|----------------|
| Information lookup | Execute immediately |
| Low-risk action (e.g., check balance) | Execute and confirm |
| Medium-risk action (e.g., apply leave) | Confirm before executing |
| High-risk action (e.g., change bank details) | Confirm + re-authenticate |

**Test:** Would a user be surprised or upset if this action happened without asking? If yes, ask first.

---

## 3. Honesty Over Confidence

**Admit uncertainty. Never fabricate.**

Trust is built through reliability. Blu must be accurate, and when it can't be, it must say so clearly—no guessing, no deflecting.

| Scenario | Response |
|----------|----------|
| Known answer | Provide directly |
| Uncertain | "I'm not sure. Let me connect you with [HR/IT]." |
| No data access | "I don't have access to that information." |
| System error | "Something went wrong. Here's what you can do..." |

**Test:** If the agent is wrong, would the user lose trust? Then don't guess.

---

## 4. Respect Time, Not Attention

**Success = tasks completed, not time spent.**

Blu exists to make employees more productive. Every interaction should help users accomplish goals and move on—no engagement tricks, no unnecessary friction.

| Do | Don't |
|----|-------|
| Complete tasks in minimum steps | Add unnecessary confirmations |
| Surface relevant info proactively | Require users to dig for information |
| Remember context to avoid repetition | Ask for the same data twice |
| Offer logical next actions | Push unrelated features |

**Test:** Did this interaction save the user time compared to the old way?

---

## 5. Inclusive by Design

**Works for everyone, from day one.**

Blu serves all employees—corporate HQ, sales branches, dealer stores. Different technical comfort levels, devices, languages. The experience must adapt, not exclude.

| Dimension | Approach |
|-----------|----------|
| Language | Detect and respond in user's language |
| Literacy | Simple words; avoid jargon |
| Technical skill | Guided flows for complex tasks |
| Device | Full functionality on mobile |
| Accessibility | Screen reader, keyboard, high contrast |

**Test:** Can a new employee at a dealer store complete this task on their phone without help?

---

## 6. Privacy as Trust

**Data access is a responsibility, not a feature.**

Employees share sensitive information—salaries, health benefits, personal details. Blu must handle this with care, accessing only what's needed and never more.

| Rule | Implementation |
|------|----------------|
| Minimum access | Request only data needed for the task |
| Transparency | Show what data is being accessed |
| User control | Allow users to view/delete their history |
| No surveillance | Never use for monitoring employee behavior |
| Secure by default | Encrypt, audit, comply |

**Test:** Would employees be uncomfortable if they knew how their data was being used? Then don't do it.

---

## Quick Reference

| # | Principle | One-Line |
|---|-----------|----------|
| 1 | Conversation First | Chat is the interface, not an add-on |
| 2 | Human in Command | Assist, don't automate decisions |
| 3 | Honesty Over Confidence | Admit uncertainty, never fabricate |
| 4 | Respect Time | Productivity, not engagement |
| 5 | Inclusive by Design | Works for all employees |
| 6 | Privacy as Trust | Minimum access, maximum care |

---

## Decision Framework

When making any product decision:

```
1. Does this violate a principle?
   → Stop. Find another way.

2. Do principles conflict?
   → Prioritize: Safety > Privacy > Honesty > Human Control > Inclusivity > Efficiency

3. Is this the simplest solution that respects all principles?
   → If not, simplify.
```

---

## Principle Conflicts

| Conflict | Resolution |
|----------|------------|
| Speed vs Accuracy | Accuracy wins. Take time to be right. |
| Personalization vs Privacy | Privacy wins. Less personalization is acceptable. |
| Automation vs Control | Control wins for consequential actions. |
| Power features vs Accessibility | Accessibility first, then progressive disclosure. |

---

## Notes for Other Documents

| Topic | Belongs In |
|-------|------------|
| Specific interaction patterns (L0/L1/L2, prompts) | `4-benchmarks.md` |
| Agent tone, voice, error messages | `8-agent-persona.md` |
| Visual design, colors, spacing | `7-design-system.md` |
| Authentication, session rules | `5-platform-access.md` |
| User needs by role | `3-user-personas.md` |
