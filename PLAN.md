# Binary Swipes — Implementation Plan

A React Native game where players practice binary search by swiping through a
binary search tree, Guitar-Hero style. Nodes rush toward the camera, and the
player swipes left (lower) or right (higher) to navigate toward a target number.

---

## 1. Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Expo SDK 52+** (managed workflow) | Fast iteration, CNG for native modules, free `eas build --local` on CI |
| Language | **TypeScript** | Type safety for game state, tree structures, and animations |
| Rendering | **@shopify/react-native-skia** | GPU-accelerated 2D canvas; perfect for the scrolling "toward you" effect |
| Animation | **react-native-reanimated v4** | UI-thread worklets drive Skia shared values at 60 FPS without bridge hops |
| Gestures | **react-native-gesture-handler v2** | Native-thread swipe detection; deep Reanimated integration |
| Navigation | **expo-router** | File-based routing for screens (Home, Game, Results) |
| State | **Zustand** | Lightweight store for game state, scores, and level progression |
| Sound | **expo-av** | Swipe feedback sounds, level-up chimes |
| CI/CD | **GitHub Actions + `eas build --local`** | Free APK artifact on every push to `main` |

---

## 2. Game Design

### 2.1 Core Loop

```
┌─────────────────────────────────────────────────────┐
│  START LEVEL                                        │
│  ├─ Generate a balanced BST for the level           │
│  ├─ Pick a random leaf/deep node as the target      │
│  ├─ Show target number at the top of the screen     │
│  ├─ Player starts at root node                      │
│  │                                                  │
│  │  GAME LOOP (each node):                          │
│  │  ├─ Current node zooms toward player             │
│  │  ├─ Player swipes LEFT (go lower) or RIGHT       │
│  │  │  (go higher)                                  │
│  │  ├─ If correct → advance to next node, score++   │
│  │  └─ If wrong → GAME OVER                         │
│  │                                                  │
│  ├─ Player reaches the target node → LEVEL COMPLETE │
│  └─ Next level: speed increases                     │
└─────────────────────────────────────────────────────┘
```

### 2.2 Swipe Semantics

- The current node displays a number (e.g., 75).
- The target is displayed at the top (e.g., "Find 55").
- If target < current node → player must **swipe LEFT** (go to left/lower child).
- If target > current node → player must **swipe RIGHT** (go to right/higher child).
- If target == current node → level is complete (auto-detected, no swipe needed).

### 2.3 Binary Tree Generation

Each level generates a BST with configurable depth:

| Level Range | Tree Depth | Node Count | Value Range |
|---|---|---|---|
| 1–3 | 3 | 7 | 1–100 |
| 4–6 | 4 | 15 | 1–200 |
| 7–9 | 5 | 31 | 1–500 |
| 10+ | 6 | 63 | 1–1000 |

Trees are generated as balanced BSTs so every path from root to leaf has
roughly equal length. The target is always a node that exists in the tree
(not necessarily a leaf — it can be at any depth ≥ 2 to guarantee at
least one swipe).

### 2.4 Speed / Difficulty Curve

Each level has a `nodeApproachDuration` (milliseconds for a node to travel
from the horizon to the swipe zone):

| Level | Duration (ms) | Feel |
|---|---|---|
| 1 | 2000 | Relaxed, tutorial-like |
| 2 | 1700 | Comfortable |
| 3 | 1400 | Medium |
| 4 | 1200 | Brisk |
| 5 | 1000 | Challenging |
| 6–7 | 850 | Fast |
| 8–9 | 700 | Very fast |
| 10+ | 550 (floor) | Expert |

If the player doesn't swipe before the node reaches them, that counts as
a wrong answer → game over.

---

## 3. Visual Design (Guitar-Hero Style)

### 3.1 Scene Layout (Skia Canvas)

```
┌──────────────────────────────┐
│  "Find: 55"         Level 3  │  ← HUD (target + level)
│                              │
│         ╱    ╲               │  ← Binary tree lines
│        ╱      ╲              │    (perspective-scaled,
│       ╱        ╲             │     fading in from back)
│      ╱          ╲            │
│    ╱──────────────╲          │
│   │      [ 75 ]    │         │  ← Current node (large,
│   │                 │         │    approaching player)
│                              │
│  ◄── SWIPE LEFT    RIGHT ──► │  ← Swipe hint zone
│                              │
│  Score: 12    Best: 47       │  ← Score bar
└──────────────────────────────┘
```

### 3.2 Animation Approach

1. **Perspective scroll**: Each node starts small at the "horizon" (center-top
   of screen) and scales up + moves down as it "approaches" the player. This
   is purely 2D scaling — no 3D engine needed. Driven by a single Reanimated
   `useSharedValue(0..1)` representing travel progress.

2. **Binary tree background**: Static or slowly animating tree structure drawn
   with Skia `<Path>` elements. The tree branches provide the "track lanes"
   similar to Guitar Hero's note highway. As the player swipes left/right,
   the tree pans to center the chosen subtree.

3. **Node transition**: After a swipe, the current node slides off-screen
   (left or right depending on the rejected subtree), the camera pans toward
   the chosen child, and the next node begins its approach from the horizon.

4. **Color coding**: Nodes the player has already passed appear greyed out
   in the background tree. The current node is highlighted. The target node
   (if visible in the tree) can pulse subtly.

### 3.3 Visual Assets

The game uses a code-generated art style (no external sprite sheets needed):

- **Nodes**: Rounded rectangles or circles drawn with Skia, filled with
  gradients. Numbers rendered as `<Text>` inside.
- **Edges**: Curved or straight `<Line>`/`<Path>` connecting nodes.
- **Background**: Dark gradient (deep blue/purple → black) to give depth.
- **Particles** (stretch goal): Small dots or sparkles trailing nodes as
  they approach, adding juice.

---

## 4. Project Structure

```
Binary-swipes/
├── app/                          # expo-router screens
│   ├── _layout.tsx               # Root layout (fonts, providers)
│   ├── index.tsx                 # Home / title screen
│   ├── game.tsx                  # Main game screen
│   └── results.tsx               # Game-over / level-complete screen
├── src/
│   ├── components/
│   │   ├── GameCanvas.tsx        # Main Skia <Canvas> wrapper
│   │   ├── NodeSprite.tsx        # Renders a single BST node
│   │   ├── TreeBackground.tsx    # Draws the binary tree "highway"
│   │   ├── HUD.tsx               # Target number, score, level
│   │   └── SwipeZone.tsx         # Gesture handler overlay
│   ├── engine/
│   │   ├── bst.ts                # BST generation & traversal logic
│   │   ├── levels.ts             # Level config (depth, speed, ranges)
│   │   └── gameLoop.ts           # Frame-driven game loop / state machine
│   ├── store/
│   │   └── gameStore.ts          # Zustand store (score, level, state)
│   ├── hooks/
│   │   ├── useGameEngine.ts      # Connects store + loop + gestures
│   │   └── useSwipeGesture.ts    # Wraps gesture-handler for L/R swipe
│   ├── utils/
│   │   └── math.ts               # Interpolation, easing helpers
│   └── constants/
│       ├── theme.ts              # Colors, spacing
│       └── difficulty.ts         # Speed/depth tables
├── assets/
│   └── sounds/                   # Swipe, correct, wrong, level-up SFX
├── .github/
│   └── workflows/
│       └── build-apk.yml        # GitHub Actions APK build
├── app.json                      # Expo config
├── eas.json                      # EAS build profiles
├── tsconfig.json
├── package.json
└── PLAN.md                       # This file
```

---

## 5. Implementation Phases

### Phase 1 — Project Scaffold & CI

**Goal**: Bootable Expo app that builds an APK on CI.

- [ ] Initialize Expo project with TypeScript template
- [ ] Install core dependencies (skia, reanimated, gesture-handler)
- [ ] Configure `app.json` (package name: `com.binaryswipes.app`, Android-only)
- [ ] Configure `eas.json` with a `preview` profile producing an APK
- [ ] Set up `.github/workflows/build-apk.yml` (details in §6)
- [ ] Add a placeholder home screen to confirm the app runs
- [ ] Verify CI produces a downloadable APK artifact

### Phase 2 — BST Engine & Core Game Logic

**Goal**: Pure-logic layer that generates trees and validates swipes.

- [ ] Implement balanced BST generation (`src/engine/bst.ts`)
  - `generateBST(depth, min, max) → BSTNode`
  - `getPathToNode(root, target) → number[]`
  - `pickTarget(root, minDepth) → number`
- [ ] Implement level configuration (`src/engine/levels.ts`)
  - Maps level number → tree depth, value range, approach speed
- [ ] Implement game state machine (`src/engine/gameLoop.ts`)
  - States: `IDLE → READY → APPROACHING → AWAITING_SWIPE → TRANSITIONING → LEVEL_COMPLETE | GAME_OVER`
  - Pure functions, no rendering dependencies
- [ ] Unit tests for BST generation and path validation

### Phase 3 — Rendering & Animation

**Goal**: Visual game that shows nodes approaching the player.

- [ ] Build `GameCanvas.tsx` with Skia `<Canvas>`
- [ ] Build `NodeSprite.tsx` — a node that scales from small (horizon) to
      large (swipe zone), driven by a shared value
- [ ] Build `TreeBackground.tsx` — draws the binary tree structure with
      perspective scaling; pans as the player navigates
- [ ] Build `HUD.tsx` — target number, current level, score
- [ ] Wire up Reanimated timing animations for node approach
- [ ] Implement the camera pan/transition when moving to a child node

### Phase 4 — Gesture Input & Game Integration

**Goal**: Playable game loop with swipe controls.

- [ ] Build `SwipeZone.tsx` with `react-native-gesture-handler` Fling or Pan
      gesture detecting left/right swipes
- [ ] Build `useSwipeGesture.ts` hook that emits `'left' | 'right'` events
- [ ] Build `useGameEngine.ts` hook that wires gesture events → game state
      machine → animation triggers
- [ ] Build Zustand store for score, current level, high score (persisted
      with `zustand/middleware` + AsyncStorage)
- [ ] Integrate everything in `app/game.tsx`
- [ ] Add swipe feedback (visual flash, optional haptics via `expo-haptics`)

### Phase 5 — Screens & Polish

**Goal**: Complete user-facing app.

- [ ] Home screen (`app/index.tsx`): Title, "Start" button, high score display
- [ ] Results screen (`app/results.tsx`): Score summary, "Play Again" / "Home"
- [ ] Add sound effects with `expo-av` (swipe, correct, wrong, level-up)
- [ ] Add countdown (3, 2, 1) before each level starts
- [ ] Visual polish: node entrance/exit animations, background parallax,
      color themes per level bracket
- [ ] Timeout handling: if player doesn't swipe in time → game over

### Phase 6 — Testing & Release Prep

**Goal**: Stable APK ready for sideloading and eventual Play Store.

- [ ] Playtest on multiple Android devices / emulators
- [ ] Performance profiling (target consistent 60 FPS)
- [ ] Accessibility: ensure text contrast, consider colorblind-friendly palette
- [ ] App icon and splash screen
- [ ] Update `README.md` with project description, screenshots, install
      instructions
- [ ] (Future) Google Play Store listing prep

---

## 6. GitHub Actions — APK Build on Push to Main

The workflow uses `eas build --local` to build entirely on the GitHub Actions
runner (free, no EAS cloud costs).

```yaml
# .github/workflows/build-apk.yml
name: Build Android APK

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"

      - name: Set up Android SDK
        uses: android-actions/setup-android@v3

      - name: Set up Expo + EAS CLI
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build APK locally
        run: eas build --platform android --profile preview --local --output ./build/binary-swipes.apk
        env:
          EAS_LOCAL_BUILD_SKIP_CLEANUP: 1

      - name: Upload APK artifact
        uses: actions/upload-artifact@v4
        with:
          name: binary-swipes-apk
          path: ./build/binary-swipes.apk
          retention-days: 30
```

**Required GitHub repo secrets**:
- `EXPO_TOKEN` — generated at https://expo.dev/accounts/[you]/settings/access-tokens

**`eas.json` config**:
```json
{
  "cli": { "version": ">= 14.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

After each push to `main`, go to the Actions tab → latest run → download the
`binary-swipes-apk` artifact → unzip → install the APK on an Android device.

---

## 7. Key Technical Decisions & Rationale

### Why Expo over bare React Native?
Runtime performance difference is <5%. Expo gives us CNG (Continuous Native
Generation), managed config plugins, `eas build --local` for free CI, and
`expo-router` for navigation. If we hit a wall, `npx expo prebuild` ejects
to bare while keeping all Expo SDK benefits.

### Why Skia instead of just Reanimated + Views?
The scrolling perspective effect, tree-line drawing, and node sprites are
fundamentally canvas operations. Skia renders directly on the GPU via JSI,
giving us pixel-level control without the overhead of the React Native view
hierarchy. Reanimated shared values pass directly into Skia component props
with zero bridge crossing.

### Why not a full game engine (Unity, Godot)?
The game is 2D, gesture-based, and relatively simple. A full engine would
add massive binary size, a different language (C#/GDScript), and complicate
CI. React Native + Skia gives us "just enough" game engine while staying
in the TypeScript/React ecosystem.

### Why Zustand over Redux or Context?
Minimal boilerplate, built-in persistence middleware, and excellent
TypeScript support. For a game with a handful of state slices (score,
level, game phase), Zustand is the right weight class.

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Skia performance on low-end Android | Choppy animations | Profile early on budget device; reduce particle effects; use `<Atlas>` for batch rendering |
| Reanimated v4 requires New Architecture | Build issues on older RN | Expo SDK 52+ enables New Architecture by default; stay on supported versions |
| `eas build --local` flakiness on CI | Blocked releases | Pin EAS CLI version; cache Gradle/NDK; add retry step |
| Gesture detection feels laggy | Bad gameplay | Gesture handler runs on native thread (not JS); tune fling velocity thresholds |
| Tree generation produces unbalanced paths | Unfair difficulty | Use explicit balanced BST algorithm; constrain target to nodes at depth ≥ 2 |
