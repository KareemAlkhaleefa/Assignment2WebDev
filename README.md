# Trivia Blast — Assignment 3: Refactoring Report

**Course:** CISC375 Web Development  
**Student:** Kareem Alkhaleefa  

---

## Table of Contents

- [Task 1a — Current Architecture](#task-1a--current-architecture)
- [Task 1b — Proposed Modular Design](#task-1b--proposed-modular-design)
- [Task 2 — Implemented Refactors](#task-2--implemented-refactors)

---

## Task 1a — Current Architecture

### Description

The Assignment 2 codebase contains **2 JavaScript files**:

| File | Lines | Responsibilities |
|------|-------|-----------------|
| `script.js` | ~402 | Global state, keyboard controls, API fetching, game logic, UI rendering, timer logic, score/lives management |
| `streak.js` | ~24 | Streak GIF display (already a small module) |

**Where responsibilities are mixed in `script.js`:**
- **Global state** (`score`, `lives`, `streak`, etc.) is declared at the top level alongside audio objects and event listeners — all in the same scope
- **API fetching** (`fetchData`) reads directly from DOM elements for its parameters instead of being a pure data function
- **Game logic** (scoring, streak multiplier, life deduction) is embedded inside the `displayQuestionAndAnswers` click handlers alongside DOM manipulation
- **Timer logic** (`startTimer`) is defined in the same file as the game orchestration, and the `timerInterval` variable is shared across multiple functions
- **UI updates** (`removeHeart`, `markDot`) sit next to business logic with no separation

### Before Diagram

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
│  <script type="module" src="script.js">              │
└────────────────────────┬────────────────────────────┘
                         │ imports
          ┌──────────────▼──────────────────────────────────┐
          │                   script.js  (~402 lines)        │
          │  ─────────────────────────────────────────────   │
          │  • Global state (score, lives, streak, timer)    │
          │  • Keyboard event listeners                      │
          │  • initQuiz()  — logo animation + countdown      │
          │  • fetchData() — API call + DOM reads            │
          │  • displayQuestionAndAnswers() — render + logic  │
          │  • gameOver()  — end screen + localStorage       │
          │  • startTimer() — interval + warning animation   │
          │  • removeHeart() — DOM: lives display            │
          │  • markDot()    — DOM: progress dots             │
          └──────────────┬──────────────────────────────────┘
                         │ imports
          ┌──────────────▼──────────────┐
          │         streak.js           │
          │  • streakImage()            │
          └─────────────────────────────┘
```

---

## Task 1b — Proposed Modular Design

### Module Definitions

#### 1. `api.js` — Data Fetching Module
> Responsible solely for fetching trivia questions from the external API with fallback support.

**Exposed exports:**
- `fetchData(categoryID, difficulty)` — fetches 10 questions from Open Trivia DB; falls back to `triviaAPI.json` on failure

#### 2. `ui-controller.js` — UI State & Timer Module
> Responsible for all DOM updates that reflect game state changes and for managing the per-question countdown timer.

**Exposed exports:**
- `removeHeart()` — removes one heart icon from the lives display
- `markDot(index, correct)` — colors a progress dot green or red
- `startTimer(onTimeout)` — starts 15-second countdown; fires callback on expiry
- `clearTimer()` — cancels the active countdown without triggering the callback

#### 3. `streak.js` *(existing)*  — Streak UI Module
> Responsible for showing or hiding the streak animation GIF.

**Exposed exports:**
- `streakImage(streak)` — displays the streak GIF when streak > 1; removes it otherwise

#### 4. `script.js` *(main orchestrator)*
> Responsible for game flow: initialization, question sequencing, answer evaluation, and end-game logic.

**Consumes:** `api.js`, `ui-controller.js`, `streak.js`

---

### Refactor Items

| # | Item | Standard | Description |
|---|------|----------|-------------|
| 1 | Extract `fetchData` into `api.js` | SRP | The data-fetching concern belongs in its own module so changes to the API URL or fallback logic never touch game code |
| 2 | Extract UI helpers + timer into `ui-controller.js` | SRP | `removeHeart`, `markDot`, and the timer interval all relate to UI state and should not share a scope with game logic |
| 3 | Pass parameters to `fetchData` instead of reading DOM inside it | SRP / DRY | A data module should not read from the DOM; callers supply values, keeping the function pure and testable |
| 4 | Rename `btn` loop variable to `button` consistently | Naming | Mixed use of `btn` and `button` for the same concept within the same function reduces readability |

---

### After Diagram

```
┌──────────────────────────────────────────────────────┐
│                    index.html                         │
│  <script type="module" src="script.js">               │
└─────────────────────┬────────────────────────────────┘
                      │ imports
     ┌────────────────▼────────────────────────────────┐
     │              script.js  (orchestrator)           │
     │  • Global state (score, lives, streak, etc.)     │
     │  • Keyboard event listeners                      │
     │  • initQuiz()   — game initialization            │
     │  • nextQuestion() — question sequencing          │
     │  • displayQuestionAndAnswers() — render + logic  │
     │  • gameOver()   — end screen + localStorage      │
     └────┬──────────────┬──────────────────┬──────────┘
          │              │                  │
          │ import       │ import           │ import
  ┌───────▼──────┐ ┌─────▼──────────┐ ┌────▼──────────┐
  │    api.js    │ │ui-controller.js│ │  streak.js    │
  │ ──────────── │ │ ─────────────  │ │ ────────────  │
  │ fetchData()  │ │ removeHeart()  │ │ streakImage() │
  └──────────────┘ │ markDot()      │ └───────────────┘
                   │ startTimer()   │
                   │ clearTimer()   │
                   └────────────────┘
```

---

## Task 2 — Implemented Refactors

### Refactor 1: `api.js` — Data Fetching Module

**Purpose:** Extract all API interaction logic into a dedicated module with a clean interface.

**Changes made:**
- Created `api.js` as a new ES6 module
- Moved `fetchData()` from `script.js` into `api.js` with `export`
- Refactored `fetchData` to accept `categoryID` and `difficulty` as **parameters** rather than reading them from the DOM — making the function a pure data utility with no side effects
- Added full JSDoc documentation (`@async`, `@param`, `@returns`)
- In `script.js`: replaced the inline function with `import { fetchData } from './api.js'` and updated the call site to pass the DOM values as arguments

**Import/export syntax used:**
```js
// api.js
export async function fetchData(categoryID, difficulty) { ... }

// script.js
import { fetchData } from './api.js';
const dataPromise = fetchData(categoryID, difficulty);
```

---

### Refactor 2: `ui-controller.js` — UI State & Timer Module

**Purpose:** Consolidate all UI-state helper functions and the countdown timer into a single module so they share their own encapsulated scope, keeping `script.js` focused on game flow.

**Changes made:**
- Created `ui-controller.js` as a new ES6 module
- Moved `removeHeart()` and `markDot()` from `script.js` into `ui-controller.js` with `export`
- Moved `startTimer()` from `script.js` into `ui-controller.js`:
  - `timerInterval` is now **privately scoped** inside the module (no longer a global)
  - Refactored to accept an `onTimeout` callback parameter, decoupling timer logic from game logic
  - Added companion `clearTimer()` export so callers can cancel the timer without direct access to the interval variable
- Added full JSDoc documentation on all four exports
- In `script.js`: removed all four functions and the `timerInterval` global; replaced all `clearInterval(timerInterval)` calls with `clearTimer()`

**Import/export syntax used:**
```js
// ui-controller.js
export function removeHeart() { ... }
export function markDot(index, correct) { ... }
export function clearTimer() { ... }
export function startTimer(onTimeout) { ... }

// script.js
import { removeHeart, markDot, startTimer, clearTimer } from './ui-controller.js';
```
