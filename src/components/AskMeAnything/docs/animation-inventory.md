# Animation Inventory

This document catalogs all animations in the AskMeAnythingV4 component. This is the source of truth for preserving animations during refactoring.

---

## CSS Keyframe Animations

| Animation Name | Duration | Easing | Trigger | Element | Description |
|----------------|----------|--------|---------|---------|-------------|
| `fadeInUp` | 0.4s-0.5s | ease | Mount / State change | Multiple (see below) | Fade in + translate up 20px |
| `slideUpFadeIn` | 0.6s | ease | Mount | `.v5-restart` button | Fade in + translate up 20px (variant) |
| `sidebarReveal` | 0.35s | ease | Sidebar opens | `.v5-sidebar.is-revealed` | Fade in + translate from right 12px |
| `spin` | 0.7s | linear | Continuous | `.spin` (progress indicator) | 360deg rotation, infinite loop |
| `blink` | 0.8s | step | Continuous | `.v5-cursor` | Cursor blinking, infinite loop |

### Keyframe Definitions

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUpFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes sidebarReveal {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

---

## Elements Using `fadeInUp` Animation

| Element | Duration | Delay Pattern | Notes |
|---------|----------|---------------|-------|
| `.v5-empty` | 0.5s | none | Empty state container |
| `.v5-chip` | 0.4s | Staggered (see below) | Initial question chips |
| `.v5-entry.active` | 0.4s | none | Active conversation entry |
| `.v5-sidebar-btn.is-new` | 0.4s | none | Newly appearing sidebar questions |

---

## Staggered Animations

### Initial Chips (`.v5-chip`)
Staggered delays for the 8 initial question chips:

| Child Index | Delay |
|-------------|-------|
| 1st | 0.10s |
| 2nd | 0.15s |
| 3rd | 0.20s |
| 4th | 0.25s |
| 5th | 0.30s |
| 6th | 0.35s |
| 7th | 0.40s |
| 8th | 0.45s |

**Pattern:** Base 0.1s + (index * 0.05s)

---

## JS Timing Constants

| Constant | Value | Purpose | Location |
|----------|-------|---------|----------|
| `SIDEBAR_UPDATE_DELAY` | 500ms | Delay before sidebar shows/updates after streaming ends | Line 11 |
| `COMPOSER_REVEAL_DELAY` | 200ms | Delay after sidebar updates before composer appears | Line 12 |
| Streaming word interval | 105ms | Time between each word appearing during answer streaming | Line 287 |
| Agent step tick | 900ms | Time between progress steps in agent tasks | Line 926 |
| Agent completion delay | 400ms | Delay after agent finishes before showing confirmation | Line 915 |
| Dentist search delay | 500ms | Delay before showing dentist results | Line 833 |
| Scroll delay | 10ms | Micro-delay before smooth scroll to active entry | Line 237 |
| Sidebar reveal done | 360ms | Timer to mark sidebar reveal animation complete | Line 325 |

---

## CSS Transitions

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| `.v5-chip` | all | 0.2s | default | hover |
| `.v5-choice` | all | 0.2s | default | hover |
| `.v5-entry` | opacity | 0.4s | ease | active state change |
| `.v5-answer` | opacity | 0.2s | ease | streaming state |
| `.v5-sidebar-btn` | background, opacity, transform | 0.2s, 0.3s, 0.3s | ease | hover / state |
| `.v5-sidebar.dimmed` | opacity | 0.3s | ease | streaming starts |
| `.v5-paused-task` | background, border-color | 0.2s | ease | hover |
| `.v5-asked-question` | background | 0.2s | ease | hover |
| `.v5-composer` | transform, opacity | 0.4s | ease | visibility toggle |
| `.v5-composer button` | opacity | 0.2s | ease | hover |
| `.v5-rail-handle` | all | 0.2s | ease | hover |
| `.v5-restart` | box-shadow | 0.2s | ease | hover |
| `.v5-next-chip` | all | 0.2s | ease | hover |

---

## Interaction-Based Animations

### Hover States

| Element | Effect | Duration |
|---------|--------|----------|
| `.v5-chip:hover` | border-color: #999 | 0.2s |
| `.v5-chip.is-task:hover` | background: #EBEBEF | 0.2s |
| `.v5-choice:hover:not(:disabled)` | border-color: #999, background: #F0F0F0 | 0.2s |
| `.v5-entry:hover` | opacity: 1 (from 0.5) | 0.4s |
| `.v5-sidebar-btn:hover:not(.disabled)` | background: #EBEBEF | 0.2s |
| `.v5-sidebar-btn.is-task:hover` | background: #EBEBEF | 0.2s |
| `.v5-paused-task:hover` | background: #EBEBEF, border-color: #C5C5CC | 0.2s |
| `.v5-asked-question:hover` | background: #DCDCE0 | 0.2s |
| `.v5-confirm-card .actions button:hover` | background: #DCFCE7 | instant |
| `.v5-next-chip:hover` | background: #F5F5F7, border-color: #C5C5CC | 0.2s |
| `.v5-next-chip.is-task:hover` | background: #EBEBEF | 0.2s |
| `.v5-composer button:hover` | opacity: 0.85 | 0.2s |
| `.v5-rail-handle:hover` | background: #EBEBEF, color: #4C4C4C | 0.2s |
| `.v5-restart:hover` | box-shadow: 0 4px 16px rgba(0,0,0,0.15) | 0.2s |

### Focus States

| Element | Effect | Duration |
|---------|--------|----------|
| `.v5-form input:focus` | border-color: #999, background: #FFF | instant |
| `.v5-form select:focus` | border-color: #999, background: #FFF | instant |

### Disabled States

| Element | Effect |
|---------|--------|
| `.v5-choice:disabled` | opacity: 0.5 |
| `.v5-dentist button:disabled` | opacity: 0.5 |
| `.v5-form .submit:disabled` | opacity: 0.4 |
| `.v5-sidebar-btn.disabled` | cursor: default, pointer-events: none |

---

## Exit Animations Needed

The following elements only have ENTER animations and need EXIT animations added:

| Element | Current Enter | Suggested Exit | Suggested Duration |
|---------|---------------|----------------|-------------------|
| `.v5-empty` | fadeInUp 0.5s | fadeOutDown | 0.15s |
| `.v5-chip` | fadeInUp 0.4s (staggered) | fadeOut | 0.15s |
| `.v5-entry.active` | fadeInUp 0.4s | fade to 0.5 opacity (already handled by transition) | - |
| `.v5-sidebar` | sidebarReveal 0.35s | sidebarHide (reverse) | 0.15s |
| `.v5-sidebar-btn.is-new` | fadeInUp 0.4s | fadeOut | 0.15s |
| `.v5-restart` | slideUpFadeIn 0.6s | slideDownFadeOut | 0.15s |
| `.v5-composer` | transform/opacity transition 0.4s | (already has exit via `is-visible` class toggle) | 0.4s |
| `.v5-task-card` | none | fadeOut | 0.15s |
| `.v5-confirm-card` | none | fadeOut | 0.15s |
| `.v5-progress-card` | none | fadeOut | 0.15s |

---

## Scroll Behavior

| Context | Behavior | Code Location |
|---------|----------|---------------|
| Active entry centering | `behavior: 'smooth'` | Line 236-240 |
| Conversation container | Dynamic paddingTop/paddingBottom for centering | Line 230-232 |

---

## Opacity States

| Element | Normal | Active/Focused | Dimmed/Disabled |
|---------|--------|----------------|-----------------|
| `.v5-entry` | 0.5 | 1 | - |
| `.v5-answer.is-writing` | - | 0.92 | - |
| `.v5-sidebar.dimmed` | - | - | 0.4 |
| `.v5-choice:disabled` | - | - | 0.5 |
| `.v5-dentist button:disabled` | - | - | 0.5 |
| `.v5-form .submit:disabled` | - | - | 0.4 |

---

## Stability-Aware Sidebar Animation Logic

The sidebar uses a stability tracking system to minimize visual disruption:

1. **Before streaming:** Save current follow-ups as `previousFollowUps`
2. **During streaming:** Show `previousFollowUps` dimmed (no animation, no interaction)
3. **After streaming:**
   - Wait `SIDEBAR_UPDATE_DELAY` (500ms)
   - Compare new questions to previous ones using `computeFollowUpsWithState()`
   - Questions that existed before get `isStable: true` (no animation)
   - New questions get `isNew: true` (fadeInUp animation)

```javascript
function computeFollowUpsWithState(previousList, newList) {
  const previousSet = new Set((previousList || []).map(item => ...));
  const result = [];
  for (const item of newList) {
    result.push({
      text,
      isTask,
      isStable: previousSet.has(text),
      isNew: !previousSet.has(text),
    });
  }
  return result;
}
```

---

## Animation Orchestration Timeline

### Question Asked Flow
```
0ms     - User clicks question
0ms     - Set askedQuestion, save previousFollowUps
0ms     - Add entry, start streaming
0ms     - Hide composer (setShowComposer(false))
105ms   - First word appears
...     - Word-by-word streaming (105ms intervals)
end     - Streaming complete
+500ms  - Sidebar updates (SIDEBAR_UPDATE_DELAY)
+700ms  - Composer reveals (SIDEBAR_UPDATE_DELAY + COMPOSER_REVEAL_DELAY)
```

### Task Agent Flow
```
0ms     - Task started
0ms     - First progress step: 'working'
900ms   - Step 1 done, Step 2 working
1800ms  - Step 2 done, Step 3 working
2700ms  - All steps done
+400ms  - Confirmation card appears
```

### Sidebar Reveal Flow
```
0ms     - First conversation entry added
+500ms  - showSidebar set to true (SIDEBAR_UPDATE_DELAY)
0-350ms - sidebarReveal animation plays
+360ms  - sidebarRevealDone set to true (removes .is-revealed class)
```

---

## Summary Statistics

- **Keyframe animations:** 5
- **CSS transitions:** 15+ unique transition rules
- **JS timing constants:** 8
- **Elements with hover states:** 13
- **Elements needing exit animations:** 9
- **Staggered animation patterns:** 1 (8-item chip sequence)
