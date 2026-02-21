# Binary Swipes — Implementation Plan

A React Native game where players practice binary search by swiping through a
binary search tree, Guitar-Hero style. Nodes rush toward the camera, and the
player swipes left (lower) or right (higher) to navigate toward a target number.

---

## 1. Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Expo SDK 54+** (managed workflow) | Fast iteration, CNG for native modules, free `eas build --local` on CI |
| Language | **TypeScript** | Type safety for game state, tree structures, and animations |
| Rendering | **@shopify/react-native-skia** | GPU-accelerated 2D canvas; perfect for the scrolling "toward you" effect |
| Animation | **react-native-reanimated v4** | UI-thread worklets drive Skia shared values at 60 FPS without bridge hops |
| Gestures | **react-native-gesture-handler v2** | Native-thread swipe detection; deep Reanimated integration |
| Navigation | **expo-router** | File-based routing for screens (Home, Game, Results) |
| State | **Zustand** | Lightweight store for game state, scores, and level progression |
| Sound | **expo-av** | Swipe feedback sounds, level-up chimes |
| CI/CD | **GitHub Actions + Gradle `assembleRelease`** | Build + test on CI, APK artifact on every push to `main`; Actions pinned to commit SHAs |

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
│       ├── build-apk.yml        # GitHub Actions APK build + test
│       └── sync-android-prebuild.yml # Sync android/ on app.json changes
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

- [x] Initialize Expo project with TypeScript template
- [x] Install core dependencies (skia, reanimated, gesture-handler)
- [x] Configure `app.json` (package name: `com.binaryswipes.app`, Android-only)
- [x] Configure `eas.json` with a `preview` profile producing an APK
- [x] Set up `.github/workflows/build-apk.yml` (details in §6)
- [x] Add a placeholder home screen to confirm the app runs
- [ ] Verify CI produces a downloadable APK artifact

### Phase 1.5 — Dependency Upgrades & Compatibility

**Goal**: Upgrade to the latest stable Expo SDK and compatible dependencies,
then confirm local start + Android release build + tests.

- [x] Inventory current versions from `package.json` / `package-lock.json`
- [x] Run `npx expo upgrade` to the latest stable SDK
- [x] Re-align Expo-managed packages with `npx expo install`:
      `expo-asset`, `expo-av`, `expo-font`, `expo-haptics`, `expo-router`,
      `expo-splash-screen`, `expo-status-bar`, `@expo/vector-icons`
- [x] Update RN ecosystem packages via `npx expo install`:
      `react-native-gesture-handler`, `react-native-reanimated`,
      `react-native-safe-area-context`, `react-native-screens`,
      `@shopify/react-native-skia`
- [x] Upgrade dev tooling to SDK-compatible versions:
      `jest`, `jest-expo`, `@types/react`, `typescript`, `@babel/core`
- [x] Regenerate lockfile with `npm install`
- [ ] If config changes require native sync, run:
      `npx expo prebuild --platform android --no-install`
- [x] Validate dependency versions:
      `npx expo install --check`
- [x] Validate project health:
      `npx expo doctor` (non-CNG warning only; no dependency mismatch)
- [x] Validate tests:
      `npm test -- --watchAll=false --passWithNoTests`
- [ ] Validate local dev server:
      `npm start`
- [x] Validate Android release build:
      `cd android && ./gradlew assembleRelease`
- [x] Stabilize incompatibilities and re-run validations until green
  - Aligned Expo peers in `package.json` (`expo-constants` and `expo-linking`)
  - Updated Gradle wrapper to `8.13`
  - Updated Android NDK requirement to `27.1.12297006`

### Phase 2 — BST Engine & Core Game Logic

**Goal**: Pure-logic layer that generates trees and validates swipes.

- [x] Implement balanced BST generation (`src/engine/bst.ts`)
  - `generateBST(depth, min, max) → BSTNode`
  - `getPathToNode(root, target) → number[]`
  - `pickTarget(root, minDepth) → number`
- [x] Implement level configuration (`src/engine/levels.ts`)
  - Maps level number → tree depth, value range, approach speed
- [x] Implement game state machine (`src/engine/gameLoop.ts`)
  - States: `IDLE → READY → APPROACHING → AWAITING_SWIPE → TRANSITIONING → LEVEL_COMPLETE | GAME_OVER`
  - Pure functions, no rendering dependencies
- [x] Unit tests for BST generation and path validation

### Phase 3 — Rendering & Animation

**Goal**: Visual game that shows nodes approaching the player.

- [x] Build `GameCanvas.tsx` with Skia `<Canvas>`
- [x] Build `NodeSprite.tsx` — a node that scales from small (horizon) to
      large (swipe zone), driven by a shared value
- [x] Build `TreeBackground.tsx` — draws the binary tree structure with
      perspective scaling; pans as the player navigates
- [x] Build `HUD.tsx` — target number, current level, score
- [x] Wire up Reanimated timing animations for node approach
- [x] Implement the camera pan/transition when moving to a child node

### Phase 4 — Gesture Input & Game Integration

**Goal**: Playable game loop with swipe controls.

- [x] Build `SwipeZone.tsx` with `react-native-gesture-handler` Fling or Pan
      gesture detecting left/right swipes
- [x] Build `useSwipeGesture.ts` hook that emits `'left' | 'right'` events
- [x] Build `useGameEngine.ts` hook that wires gesture events → game state
      machine → animation triggers
- [x] Build Zustand store for score, current level, high score (persisted
      with `zustand/middleware` + AsyncStorage)
- [x] Integrate everything in `app/game.tsx`
- [x] Add swipe feedback (visual flash, optional haptics via `expo-haptics`)

### Phase 5 — Screens & Polish

**Goal**: Complete user-facing app.

- [x] Home screen (`app/index.tsx`): Title, "Start" button, high score display
- [x] Results screen (`app/results.tsx`): Score summary, "Play Again" / "Home"
- [x] Add sound effects with `expo-av` (swipe, correct, wrong, level-up)
- [x] Add countdown (3, 2, 1) before each level starts
- [x] Visual polish: node entrance/exit animations, background parallax,
      color themes per level bracket
- [x] Timeout handling: if player doesn't swipe in time → game over

### Phase 6 — Testing & Release Prep

**Goal**: Stable APK ready for sideloading and eventual Play Store.

- [ ] Playtest on multiple Android devices / emulators
- [ ] Performance profiling (target consistent 60 FPS)
- [x] Accessibility: ensure text contrast, consider colorblind-friendly palette
- [x] App icon and splash screen
- [x] Update `README.md` with project description, screenshots, install
      instructions
- [ ] (Future) Google Play Store listing prep

---

## 6. GitHub Actions — APK Build on Push to Main

The workflow builds Android natively with Gradle on the GitHub Actions runner
and runs tests first. GitHub Actions are pinned to commit SHAs for supply-chain
hardening.

```yaml
# .github/workflows/build-apk.yml
name: Build Android APK

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # actions/checkout v4.3.1
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5

      # actions/setup-node v4.4.0
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --watchAll=false --passWithNoTests

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      # actions/checkout v4.3.1
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5

      # actions/setup-node v4.4.0
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020
        with:
          node-version: 22
          cache: npm

      # actions/setup-java v4.8.0
      - uses: actions/setup-java@c1e323688fd81a25caa38c78aa6df2d33d3e20d9
        with:
          distribution: temurin
          java-version: "17"

      - name: Install Android SDK components
        run: |
          yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
          $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \
            "platforms;android-35" \
            "build-tools;35.0.0" \
            "ndk;27.1.12297006"

      - name: Install dependencies
        run: npm ci

      - name: Build APK
        run: cd android && chmod +x gradlew && ./gradlew assembleRelease

      # actions/upload-artifact v4.6.2
      - uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02
        with:
          name: binary-swipes-apk-${{ github.sha }}
          path: android/app/build/outputs/apk/release/*.apk
          retention-days: 30
```

**Required GitHub repo secrets**:
- None (uses the default `GITHUB_TOKEN` only).

After each push to `main`, go to the Actions tab → latest run → download the
`binary-swipes-apk` artifact → unzip → install the APK on an Android device.

### 6.1 Sync Android Native Files on `app.json` Change

When `app.json` changes, a separate workflow runs `expo prebuild` and commits
updated `android/` files back to the branch. Actions are pinned to SHAs.

```yaml
# .github/workflows/sync-android-prebuild.yml
name: Sync Android Native Files

on:
  push:
    paths:
      - app.json

jobs:
  prebuild:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      # actions/checkout v4.3.1
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5
        with:
          ref: ${{ github.ref_name }}
          token: ${{ secrets.GITHUB_TOKEN }}

      # actions/setup-node v4.4.0
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run expo prebuild
        run: npx expo prebuild --platform android --no-install

      - name: Check for android/ changes
        id: changes
        run: |
          git diff --quiet android/ || echo "changed=true" >> $GITHUB_OUTPUT

      - name: Commit updated android/ files
        if: steps.changes.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add android/
          git commit -m "chore: sync android/ after app.json change [skip ci]"
          git push
```

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
| Reanimated v4 requires New Architecture | Build issues on older RN | Expo SDK 54+ enables New Architecture by default; stay on supported versions |
| `eas build --local` flakiness on CI | Blocked releases | Pin EAS CLI version; cache Gradle/NDK; add retry step |
| Gesture detection feels laggy | Bad gameplay | Gesture handler runs on native thread (not JS); tune fling velocity thresholds |
| Tree generation produces unbalanced paths | Unfair difficulty | Use explicit balanced BST algorithm; constrain target to nodes at depth ≥ 2 |
