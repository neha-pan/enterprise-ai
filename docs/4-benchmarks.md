# Benchmarks & Principles

## Benchmark Sources

| Platform | Focus Area | Key Strength |
|----------|------------|--------------|
| Claude | Conversational depth, reasoning transparency | Clean minimalism, project organization |
| ChatGPT | Task completion, generative UI | Cards, canvas mode, memory controls |
| Microsoft Copilot | Enterprise integration, agentic workflows | Inline vs side-by-side, conversation-first |
| Gemini | Multi-modal, contextual awareness | Voice integration, cross-device continuity |
| Amazon Rufus | Shopping assistance, intent detection | Product-aware prompts, guided flows |
| Bajaj Chat (Internal) | Financial services, form journeys | Journey levels, supporting prompts |

---

## Core Principles

### 1. Conversation is the Interface

**Principle:** Chat is the primary interaction model, not a secondary feature.

- User describes intent in natural language; system interprets and acts
- Replace form navigation with conversational flows
- Complex tasks happen through dialogue, not page-hopping
- Chat enhances productivity; it doesn't replicate existing UIs

**For Blu:** Employees ask "Book a cab for tomorrow 8 AM" instead of navigating to Employee Services Portal → Travel & Stay → Cab Booking → Fill Form.

---

### 2. Progressive Task Disclosure

**Principle:** Reveal complexity only when needed.

| Level | Description | Example |
|-------|-------------|---------|
| L0 | Chat launched, no input yet | Show contextual opening prompts |
| L1 | User provides initial input | Respond + offer supporting prompts |
| L2 | Multi-turn conversation | Maintain context, guide to completion |

- Start with simple interactions; expand as task demands
- Don't overwhelm with options upfront
- Use inline for quick actions; expand for complex workflows

---

### 3. Supporting Prompts at Every Turn

**Principle:** After every response, offer relevant next actions.

**Rules:**
- Maximum 3 supporting prompts per response
- 1 primary prompt, 2 secondary prompts
- Prompts must be contextual to current conversation
- Character limit ensures single-row display

**Prompt Types:**
| Type | When | Example |
|------|------|---------|
| Contextual | Based on current query | "Apply for Personal Loan" after eligibility check |
| Continuation | Resume interrupted flow | "Continue with your leave application" |
| Cross-functional | Related actions | "Check your claim status" after submitting claim |

---

### 4. Intent Detection & Categorization

**Principle:** Classify user queries to tailor response strategy.

| Category | Description | Response Style |
|----------|-------------|----------------|
| Information Seeking | General questions | Informative, educational |
| Account-Specific | Personal data queries | Fetch and display, supportive |
| Action/Transaction | Task execution | Guide through steps, confirmative |

**For Blu:** "What is my leave balance?" (Account-Specific) vs "How do I apply for leave?" (Information) vs "Apply for 2 days leave" (Action).

---

### 5. Form Fields in Chat

**Principle:** Collect structured data conversationally, not via traditional forms.

**Field Types:**
- **Standalone:** Can be asked/edited individually (Name, Email)
- **Clustered:** Must be collected together (Address + City + Pincode)

**Rules:**
- Ask clustered fields in sequence
- Provide edit action for every field input
- Show pre-submission summary at critical stages
- Request consent before proceeding after key detail changes

---

### 6. Context Preservation

**Principle:** Never make users repeat themselves.

| Context Type | Behavior |
|--------------|----------|
| Session | Remember all inputs within current conversation |
| Cross-session | Recall previous interactions, pending journeys |
| Cross-platform | Sync history across web, mobile, integrations |
| Page context | Use current screen location for relevant prompts |

**Memory Controls:**
- Users can view, edit, or disable specific memories
- Clear separation between session and persistent memory
- Pending journeys surface on chat launch

---

### 7. Graceful Error Handling

**Principle:** Errors should guide, not block.

| Error Type | Response Pattern |
|------------|------------------|
| Unknown query | Admit limitation + suggest alternatives |
| System failure | Apologize briefly + offer retry or escalation |
| Invalid input | Explain what's wrong + how to fix |
| Dead end | Provide restart prompts |

**Rules:**
- Haptic feedback with visual error states
- Never guess when uncertain—admit and redirect
- Maintain politeness even when users are frustrated
- Escalate flagged scenarios to human agents

---

### 8. Human Control & Confirmation

**Principle:** Users remain decision-makers for consequential actions.

- Explicit confirmation before sensitive operations
- Clear visibility into what agent is doing
- Transparent outcomes (what was created, modified, sent)
- Edit capability before final submission
- Consent required for third-party redirections

---

### 9. Session Management

**Principle:** Clear session boundaries with easy resumption.

| Rule | Detail |
|------|--------|
| Session close | User confirms completion OR 60 min inactivity |
| History access | Last 10 sessions viewable |
| Re-initiation | Can resume closed session anytime |
| Rating | Prompt for feedback on session close |
| Storage | 7-day chat history retention |

---

### 10. Multi-Modal Input

**Principle:** Support multiple input methods seamlessly.

| Mode | Capability |
|------|------------|
| Text | Primary input with send button appearing on input |
| Voice | Microphone icon; speech-to-text conversion |
| Voice output | Read-aloud option for responses |
| Document | Share documents to email/device |
| Quick actions | Tap-to-select prompts |
| Video | Tutorials and Annoucements

---

### 11. Response Formatting

**Principle:** Structure responses for scannability.

| Content Type | Format |
|--------------|--------|
| Single fact | One sentence |
| Multiple items | Bulleted list |
| Comparisons | Tables |
| Processes | Numbered steps |
| Actions | CTA buttons |

**Rules:**
- Bot response width ≤80% of user message alignment
- Multi-query inputs answered in order with "read more" for subsequent
- Feedback (thumbs up/down) after every bot-generated response
- Results can include text, images, data visualization, CTAs, video

---

### 12. Vernacular & Accessibility

**Principle:** Communicate in the user's language.

- Detect input language; respond in same language
- Results available in multiple languages
- Use simple English (Hemingway score 6-8)
- Explain jargon with contextual prompts
- Avoid bias, sarcasm, culturally insensitive language

---

### 13. Critical Information Priority

**Principle:** Surface urgent items proactively.

| Priority | Trigger |
|----------|---------|
| Critical reminders | Pending EMI, compliance deadlines |
| Status updates | Application progress, request status |
| Pending journeys | Incomplete forms, abandoned flows |

**Rules:**
- Critical reminders highlighted on chat launch
- Pending journey prompts based on most recent activity
- No cross-product prompts on unrelated pages (exceptions defined by business)

---

### 14. Inline vs Expanded Interactions

**Principle:** Scale UI density with task complexity.

| Mode | Use For |
|------|---------|
| Inline | Previews, confirmations, simple actions, quick decisions |
| Expanded | Multi-step editing, iterative workflows, complex tables |

**Inline Rules:**
- Single response to Fit within single scroll
- Max 2 actions per card
- No nested navigation, tabs, or internal scrolling
- Complements chat; doesn't replace it


---

### 16. Expectation Management

**Principle:** Be upfront about capabilities and limitations.

- Display disclaimer that AI responses may not be 100% accurate
- Avoid speculative answers; admit when information unavailable
- Update knowledge bases regularly for accuracy
- Never invent dates, amounts, or details

---

## Anti-Patterns to Avoid

| Don't | Why |
|-------|-----|
| Replicate full applications in chat | Chat enhances; doesn't replace |
| Deep navigation in widgets | Keep interactions focused |
| Scroll-heavy inline layouts | Use expanded mode instead |
| Duplicate content in response + widget | Reduces clarity |
| Multiple drill-ins or tabs in cards | Split into separate cards |
| Over-enthusiastic language | Feels inauthentic |
| Repeat same response to repeated questions | Provide different helpful response |
| Allow message editing after send | Prevents confusion |

---

## Sources

- [OpenAI UI Guidelines](https://developers.openai.com/apps-sdk/concepts/ui-guidelines)
- [OpenAI UX Principles](https://developers.openai.com/apps-sdk/concepts/ux-principles)
- [Microsoft Copilot UX Guidelines](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/declarative-agent-ui-widgets-guidelines)
- [Chat UI Design Trends 2025](https://multitaskai.com/blog/chat-ui-design/)
- [9 UX Patterns for Trustworthy AI](https://orangeloops.com/2025/07/9-ux-patterns-to-build-trustworthy-ai-assistants/)
- Bajaj Internal Chat UI Principles
