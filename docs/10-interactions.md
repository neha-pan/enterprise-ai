# Interaction System Guide (Gemini-Informed)

> **Purpose:** Provide a compact, implementation-ready interaction spec for Blu surfaces (chat, cards, composer, onboarding, status states).  
> **Primary source:** [Google Design: Gemini AI Visual Design](https://design.google/library/gemini-ai-visual-design)

---

## 1) Core Interaction Model

### 1.1 Product reality
- AI products are **continuously evolving**, so interaction design must prioritize:
  - trust through clarity
  - guidance through motion
  - familiar structure with adaptive behavior

### 1.2 Interaction goals
- Make interactions feel:
  - intuitive
  - approachable
  - responsive
  - transparent (system is "working with me")

### 1.3 Design consequence
- Avoid static, overly rigid metaphors for AI states.
- Use directional visual signals and staged state transitions so users can:
  - discover
  - learn
  - repeat with confidence

---

## 2) Signal Taxonomy (What to Use)

## 2.1 Gradients as directional cues
- Gradients are not decoration; they are **attention vectors**.
- Use concentrated-to-diffuse flow to indicate:
  - where focus should move
  - energy transfer
  - progression from input to synthesis

### Use cases
- voice/transcription in progress
- feature introduction
- directional onboarding guidance

## 2.2 Rounded shape language
- Rounded containers/buttons communicate:
  - continuity
  - comfort
  - familiarity
- Shapes should "contain and release" activity:
  - concentrated state -> expanded state
  - constrained input -> broadened output

## 2.3 Intentional motion
- Motion must always have:
  - clear start
  - clear end
  - visible purpose
- Motion communicates:
  - listening
  - thinking
  - synthesizing
  - readiness

### Required motion character
- anticipatory -> release
- steady, non-jittery
- informative before expressive

## 2.4 Softness under uncertainty
- For novel/uncertain AI flows, visual tone must be soft:
  - gentle pulse
  - low-contrast backgrounds
  - clear text labels
- Goal: reduce fear of failure and encourage exploration.

---

## 3) Interaction State Map (Agent + UI)

| State | User question | Primary cue | Secondary cue | Must be explicit |
|---|---|---|---|---|
| Idle/Home | "What can I do?" | Stable rounded cards | Soft brand pill | Next actions |
| Listening/Input | "Did it receive me?" | Active input emphasis | Subtle pulse | Capture in progress |
| Thinking/Processing | "Is it working?" | Directed motion | Step/progress states | What is being checked |
| Synthesizing/Generating | "Where is this going?" | Forward gradient flow | Incremental reveal | Output forming |
| Ready/Result | "What changed?" | Settled container | Success/info badge | Outcome + next step |
| Error/Unclear | "What do I do now?" | Calm warning styling | Recovery CTA | Exact correction path |
| Feature Discovery | "Why this?" | Guided icon emphasis | Short helper copy | New feature intent |

---

## 4) Hard Rules for Platform Interactions

## 4.1 Motion rules
- Every animation must map to a semantic state.
- No perpetual ambient animation without user value.
- Motion duration should support scanning, not spectacle.
- If motion does not improve comprehension, remove it.

## 4.2 Directionality rules
- Direction cues must align with information flow:
  - input -> analysis -> result
- Never use opposing directional cues simultaneously in the same context block.

## 4.3 Progress transparency rules
- Processing states must say **what** is being processed.
- Multi-step operations should expose ordered steps when possible.
- Final state must summarize outcome and provide one clear next action.

## 4.4 Softness and confidence rules
- New/complex tasks:
  - use soft containers
  - progressive disclosure
  - forgiving recovery copy
- Keep tone calm and direct, consistent with `8-agent-persona.md`.

## 4.5 Familiarity rules
- Reuse stable interaction primitives:
  - rounded action cards
  - consistent badge semantics
  - consistent composer behavior
- Users should "learn once, apply repeatedly."

---

## 5) Platform Pattern Library (Apply in This Repo)

## 5.1 Next-actions block
- Keep one canonical container/button system across role homes.
- Action buttons must maintain consistent:
  - shape
  - spacing
  - icon sizing
  - label case rules

## 5.2 Chat/task flow
- Home -> Prompt -> Processing -> Resolution -> Follow-up.
- Show visible transitions between phases rather than abrupt state swaps.

## 5.3 Badges/pills
- Pills encode context (role, mode, status), not decoration.
- Maintain accessible contrast in both themes.
- Keep visual subtlety in background; place contrast burden on text layer.

## 5.4 Composer behavior
- Placeholder and enabled/disabled behavior should reflect current flow state.
- Avoid ambiguous disabled states; always imply what unlocks next.

## 5.5 Error handling interactions
- Error UI must provide:
  - exact problem
  - exact corrective input
  - immediate retry path

---

## 6) Accessibility and Clarity Baseline

- Text contrast must meet WCAG AA minimum (4.5:1 for normal text).
- Motion should be:
  - subtle
  - purposeful
  - interruptible by state completion
- Do not rely on color alone to convey state; pair with icon/text.

---

## 7) Anti-Patterns (Do Not Ship)

- Decorative motion with no semantic meaning.
- Pulsing/animation that continues after state completion.
- Inconsistent button geometry for similar actions.
- "Mystery processing" (spinner with no explanation).
- Dense, high-energy visuals during error or uncertainty states.
- Introducing new visual metaphors per screen without shared grammar.

---

## 8) PR Review Checklist (Interaction)

- [ ] Does each animated element map to a user-understandable state?
- [ ] Is flow direction visually consistent from input to output?
- [ ] Is processing transparent (what is happening, not just that something is happening)?
- [ ] Are next actions clear and structurally consistent with existing patterns?
- [ ] Are badge/pill and status colors accessible in dark and light themes?
- [ ] Is recovery from error obvious in one step?
- [ ] Does this interaction feel familiar with existing platform behavior?

---

## 9) Source-to-Platform Mapping

| Source concept | Platform application |
|---|---|
| Dynamic cues for trust in evolving AI | Explicit state transitions in chat/task flows |
| Gradients as directional energy | Guided attention in onboarding, voice, and feature reveals |
| Circle/rounded familiarity | Consistent rounded cards, buttons, containers, pills |
| Intentional motion with start/end | Deterministic animation per state change |
| Softness during change | Gentle onboarding/recovery experiences with clear language |
| Guided discoverability | Contextual next-actions and transparent system signaling |

---

## 10) Scope Note

This document intentionally focuses on **interaction semantics and behavior design** derived from the source article. It excludes broader branding, campaign, and non-interaction editorial context.
