# Binary Swipes

A React Native game for practising binary search. Nodes rush toward you
Guitar-Hero style — swipe left to go lower, swipe right to go higher, and
navigate the binary search tree to find the target number before time runs out.
Each level gets faster.

## How to play

The target number is shown at the top of the screen. You start at the root of
a binary search tree and must swipe your way down to that number.

| Swipe | Meaning |
|---|---|
| ◀ Left | Go to the lower (left) child |
| ▶ Right | Go to the higher (right) child |

Swipe the wrong way or run out of time → game over. Reach the target → level
complete. Every level increases speed and tree depth.

## Tech stack

| Layer | Library |
|---|---|
| Framework | Expo SDK 52 (managed workflow, New Architecture) |
| Language | TypeScript |
| Rendering | @shopify/react-native-skia |
| Animation | react-native-reanimated v3 |
| Gestures | react-native-gesture-handler |
| Navigation | expo-router |
| State | Zustand |
| Haptics / Sound | expo-haptics, expo-av |

## Project structure

```
app/                   expo-router screens
  _layout.tsx          root layout (GestureHandlerRootView, StatusBar)
  index.tsx            home screen
  game.tsx             game screen
  results.tsx          game-over / level-complete screen

src/
  engine/
    bst.ts             balanced BST generation and traversal (pure logic)
    gameLoop.ts        game state machine (pure functions, no UI)
    levels.ts          per-level data factory
  constants/
    difficulty.ts      speed/depth table for each level
    theme.ts           colours, font sizes, layout constants
  components/
    GameCanvas.tsx     root game view, composes all subcomponents
    TreeBackground.tsx Skia canvas drawing the BST "highway"
    NodeSprite.tsx     approaching node (Reanimated-driven scale/position)
    SwipeZone.tsx      gesture detector + wrong-swipe flash overlay
    HUD.tsx            target number, score, and level display
    CountdownOverlay.tsx  3-2-1-GO! countdown animation
  hooks/
    useGameEngine.ts   wires store → animations → haptics → timeouts
    useSwipeGesture.ts native-thread pan gesture → left/right events
  store/
    gameStore.ts       Zustand store (score, level, high score)
  utils/
    math.ts            lerp, clamp, easing helpers
```

## Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- For running on a physical device: the [Expo Go](https://expo.dev/go) app
- For running on an emulator: Android Studio with an AVD configured

## Running locally

```bash
# 1. Clone the repo
git clone https://github.com/lpmi-13/Binary-swipes.git
cd Binary-swipes

# 2. Install dependencies
npm install

# 3. Start the Expo dev server
npm start
```

The Metro bundler will start and print a QR code. From there:

- **Physical device** — scan the QR code with the Expo Go app (Android or iOS)
- **Android emulator** — press `a` in the terminal (requires Android Studio + a running AVD)
- **iOS simulator** — press `i` (macOS only, requires Xcode)

## Building an APK

### Locally (one-off)

Install EAS CLI, then build an APK directly on your machine:

```bash
npm install -g eas-cli
eas build --platform android --profile preview --local
```

The APK will be written to the current directory. Transfer it to an Android
device and install it directly.

### Via GitHub Actions (automatic)

Every push to `main` triggers the build workflow at
`.github/workflows/build-apk.yml`. It runs `eas build --local` on a
GitHub-hosted Ubuntu runner (free, no EAS cloud costs) and uploads the result
as a downloadable artifact.

**One-time setup:**

1. Generate an Expo access token at
   `https://expo.dev/accounts/<your-username>/settings/access-tokens`
2. Add it as a repository secret named `EXPO_TOKEN`
   (Settings → Secrets and variables → Actions → New repository secret)

After the workflow completes, go to the Actions tab → the latest run →
**Artifacts** → download `binary-swipes-apk-<sha>` → unzip → install the APK.

## Difficulty curve

| Level | Tree depth | Approach speed |
|---|---|---|
| 1 | 3 (7 nodes) | 2.2 s |
| 3 | 3 | 1.6 s |
| 5 | 4 (15 nodes) | 1.2 s |
| 7 | 5 (31 nodes) | 0.9 s |
| 10+ | 6 (63 nodes) | 0.55 s (floor) |

## Roadmap

- [ ] Persistent high score (AsyncStorage)
- [ ] Sound effects (swipe, correct, wrong, level-up)
- [ ] Particle trail on approaching nodes
- [ ] Colour theme unlocks per level bracket
- [ ] Google Play Store release
