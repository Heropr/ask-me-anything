# Chip/Button Variant Audit

This document audits all chip and button variants found in `AskMeAnythingV4.jsx` and `AskMeAnythingV4.css` to identify consolidation opportunities.

---

## 1. Initial Chips (`.v5-chip`)

### Where Used
- **Location**: Empty state of the main view (before any conversation starts)
- **JSX**: Lines 1057-1068 in `AskMeAnythingV4.jsx`
- **Context**: Displayed in the `v5-chips` container as the initial "What can I help you with?" prompts

### Styling

| Property | Value |
|----------|-------|
| display | `inline-flex` |
| align-items | `center` |
| gap | `8px` |
| padding | `8px 16px` |
| border | `1px solid #E1E1E6` |
| border-radius | `12px` |
| background | `#F5F5F8` |
| font-family | `"DM Sans", sans-serif` |
| font-size | `14px` |
| font-weight | `500` |
| color | `#333333` |

### States

| State | Changes |
|-------|---------|
| **Default** | As above |
| **Hover** | `border-color: #999` |
| **`.is-task` variant** | `background: #F5F5F8`, `border-color: #E1E1E6`, `color: #333333` (same as default) |
| **`.is-task:hover`** | `background: #EBEBEF` |

### Animation Behavior
- Initial opacity: `0`
- Animation: `fadeInUp 0.4s ease forwards`
- Staggered delays: Each chip gets progressively longer delay (0.1s, 0.15s, 0.2s, etc.)
- Chips 1-8 have delays from 0.1s to 0.45s

---

## 2. Sidebar Buttons (`.v5-sidebar-btn`)

### Where Used
- **Location**: Sidebar panel showing suggested/related questions
- **JSX**: Lines 1147-1191 in `AskMeAnythingV4.jsx`
- **Context**: Dynamic follow-up questions that update based on conversation context

### Styling

| Property | Value |
|----------|-------|
| display | `flex` |
| align-items | `center` |
| gap | `10px` |
| padding | `12px 16px` |
| border | `none` |
| border-radius | `12px` |
| background | `#F5F5F8` |
| font-family | `"DM Sans", sans-serif` |
| font-size | `14px` |
| font-weight | `500` |
| line-height | `20px` |
| text-align | `left` |
| color | `#1F1F1F` |

### States

| State | Changes |
|-------|---------|
| **Default** | As above |
| **Hover** | `background: #EBEBEF` |
| **`.is-task` variant** | `background: #F5F5F8`, `border: 1px solid #E1E1E6` |
| **`.is-task:hover`** | `background: #EBEBEF` |
| **`.is-stable`** | `opacity: 1` |
| **`.is-new`** | `animation: fadeInUp 0.4s ease forwards`, `opacity: 0` |
| **`.disabled`** | `cursor: default`, `pointer-events: none`, `opacity: 1` |

### Animation Behavior
- Stability-aware: Existing items (`.is-stable`) appear immediately
- New items (`.is-new`) animate in with `fadeInUp 0.4s ease`
- Transition on base: `background 0.2s ease, opacity 0.3s ease, transform 0.3s ease`

---

## 3. Next-Step Chips (`.v5-next-chip`)

### Where Used
- **Location**: Footer of completed task confirmation cards
- **JSX**: Lines 1299-1315 in `AskMeAnythingV4.jsx` (inside `TaskCard` component)
- **Context**: "What's next?" suggestions after a task is completed

### Styling

| Property | Value |
|----------|-------|
| display | `inline-flex` |
| align-items | `center` |
| gap | `8px` |
| padding | `8px 14px` |
| border | `1px solid #E1E1E6` |
| border-radius | `20px` |
| background | `#FFF` |
| font-family | `"DM Sans", sans-serif` |
| font-size | `13px` |
| color | `#333` |

### States

| State | Changes |
|-------|---------|
| **Default** | As above |
| **Hover** | `background: #F5F5F7`, `border-color: #C5C5CC` |
| **`.is-task` variant** | `background: #F5F5F8`, `border-color: #E1E1E6`, `color: #333333` |
| **`.is-task:hover`** | `background: #EBEBEF` |

### Animation Behavior
- Transition: `all 0.15s ease`
- No entrance animation defined

---

## 4. Choice Buttons (`.v5-choice`)

### Where Used
- **Location**: Task card choice selections (e.g., "What brings you in today?")
- **JSX**: Lines 1232-1243 in `AskMeAnythingV4.jsx` (inside `TaskCard` component)
- **Context**: Multi-choice selections during task flows

### Styling

| Property | Value |
|----------|-------|
| display | `flex` |
| align-items | `center` |
| gap | `12px` |
| padding | `14px 16px` |
| border | `1px solid #E5E5E5` |
| border-radius | `12px` |
| background | `#FAFAFA` |
| font-family | `"DM Sans", sans-serif` |
| font-size | `15px` |
| text-align | `left` |

### States

| State | Changes |
|-------|---------|
| **Default** | As above |
| **Hover** | `border-color: #999`, `background: #F0F0F0` |
| **Disabled** | `opacity: 0.5`, `cursor: default` |

### Animation Behavior
- Transition: `all 0.2s`
- No entrance animation defined

---

## Comparison Table

| Property | `.v5-chip` | `.v5-sidebar-btn` | `.v5-next-chip` | `.v5-choice` |
|----------|------------|-------------------|-----------------|--------------|
| **padding** | `8px 16px` | `12px 16px` | `8px 14px` | `14px 16px` |
| **border** | `1px solid #E1E1E6` | `none` | `1px solid #E1E1E6` | `1px solid #E5E5E5` |
| **border-radius** | `12px` | `12px` | `20px` | `12px` |
| **background** | `#F5F5F8` | `#F5F5F8` | `#FFF` | `#FAFAFA` |
| **font-size** | `14px` | `14px` | `13px` | `15px` |
| **font-weight** | `500` | `500` | (inherit) | (inherit) |
| **color** | `#333333` | `#1F1F1F` | `#333` | (inherit) |
| **gap** | `8px` | `10px` | `8px` | `12px` |
| **hover bg** | (none, border only) | `#EBEBEF` | `#F5F5F7` | `#F0F0F0` |
| **hover border** | `#999` | (none) | `#C5C5CC` | `#999` |
| **entrance anim** | `fadeInUp` staggered | conditional `fadeInUp` | none | none |
| **transition** | `all 0.2s` | `bg 0.2s, opacity 0.3s, transform 0.3s` | `all 0.15s` | `all 0.2s` |

### Border Colors Comparison
- `#E1E1E6` - Used by `.v5-chip`, `.v5-next-chip`, `.v5-sidebar-btn.is-task`
- `#E5E5E5` - Used by `.v5-choice`

### Background Colors Comparison
- `#F5F5F8` - Used by `.v5-chip`, `.v5-sidebar-btn`, `.v5-next-chip.is-task`
- `#FAFAFA` - Used by `.v5-choice`
- `#FFF` - Used by `.v5-next-chip` (default)

---

## Recommendation

### What Could Be Unified

**High potential for consolidation:**

1. **`.v5-chip` and `.v5-sidebar-btn`** - These are nearly identical:
   - Same background (`#F5F5F8`)
   - Same border-radius (`12px`)
   - Same font-size (`14px`) and font-weight (`500`)
   - Minor differences: padding (8px vs 12px vertical), border (present vs absent), color (#333333 vs #1F1F1F)

2. **`.v5-chip` and `.v5-next-chip`** - Very similar structure:
   - Same border color (`#E1E1E6`)
   - Same gap (`8px`)
   - Minor differences: padding, border-radius (12px vs 20px), font-size (14px vs 13px)

### Differences That Seem Intentional

1. **Border-radius `20px` on `.v5-next-chip`** - This creates a more "pill-like" appearance, likely intentional to visually differentiate footer suggestions from primary chips.

2. **`.v5-choice` larger padding and font-size** - These are meant to be larger, more prominent selection options within task cards. The extra vertical padding (14px) makes them easier tap targets.

3. **White background on `.v5-next-chip`** - Appears intentional to stand out against the green confirmation card background (`#F0FDF4`).

4. **No border on `.v5-sidebar-btn`** - This makes sidebar items feel less "button-like" and more like list items, which is appropriate for a sidebar context.

### Differences That Seem Accidental

1. **Border color inconsistency**: `#E1E1E6` vs `#E5E5E5` - These are nearly identical grays and could be unified.

2. **Text color inconsistency**: `#333333` vs `#333` vs `#1F1F1F` - All dark grays, should be unified.

3. **Background inconsistency**: `#F5F5F8` vs `#FAFAFA` - These are nearly identical light grays.

4. **Gap values**: `8px`, `10px`, `12px` - Minor variations that could be standardized.

---

## Proposed Unified API

### Option A: Single Base Component with Variants

```css
/* Base chip styles */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--chip-border, #E1E1E6);
  border-radius: var(--chip-radius, 12px);
  background: var(--chip-bg, #F5F5F8);
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:hover {
  background: #EBEBEF;
  border-color: #999;
}

/* Size variants */
.chip--sm { padding: 8px 14px; font-size: 13px; }
.chip--lg { padding: 14px 16px; font-size: 15px; gap: 12px; }

/* Style variants */
.chip--pill { --chip-radius: 20px; }
.chip--borderless { border: none; }
.chip--white { --chip-bg: #FFF; }

/* State variants */
.chip--task { /* Task styling with icon support */ }
.chip--disabled { opacity: 0.5; pointer-events: none; }
```

### Option B: Semantic Components (Recommended)

Create three semantic chip types:

1. **`<SuggestionChip>`** - For initial prompts and sidebar suggestions
2. **`<ChoiceButton>`** - For task card selections (keep distinct, larger targets)
3. **`<NextStepChip>`** - For confirmation card footers

Shared CSS custom properties:

```css
:root {
  --chip-font: "DM Sans", sans-serif;
  --chip-border-color: #E1E1E6;
  --chip-bg-light: #F5F5F8;
  --chip-bg-hover: #EBEBEF;
  --chip-text-color: #333333;
  --chip-radius-default: 12px;
  --chip-radius-pill: 20px;
}
```

### Migration Path

1. **Phase 1**: Standardize color tokens (border, background, text colors)
2. **Phase 2**: Unify `.v5-chip` and `.v5-sidebar-btn` into one component with a `borderless` modifier
3. **Phase 3**: Keep `.v5-next-chip` separate but using shared tokens (intentional pill shape)
4. **Phase 4**: Keep `.v5-choice` separate (intentionally larger for tap targets)

---

## Summary

| Component | Consolidate? | Rationale |
|-----------|--------------|-----------|
| `.v5-chip` | Yes (with sidebar-btn) | Nearly identical, minor differences are accidental |
| `.v5-sidebar-btn` | Yes (with chip) | Same as above |
| `.v5-next-chip` | Partial | Share tokens but keep pill shape as variant |
| `.v5-choice` | No | Intentionally larger for task selection UI |

**Estimated savings**: Consolidating `.v5-chip` and `.v5-sidebar-btn` would eliminate ~40 lines of duplicate CSS and create a single mental model for developers.
