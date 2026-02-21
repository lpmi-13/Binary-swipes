import { Audio } from 'expo-av';

type SoundKey = 'swipe' | 'correct' | 'wrong' | 'level';

const soundSources: Record<SoundKey, number> = {
  swipe: require('../../assets/sounds/swipe.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  level: require('../../assets/sounds/level.wav'),
};

const sounds: Partial<Record<SoundKey, Audio.Sound>> = {};
let audioModeReady = false;

async function ensureAudioMode() {
  if (audioModeReady) return;
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  audioModeReady = true;
}

export async function preloadSounds(): Promise<void> {
  await ensureAudioMode();
  await Promise.all(
    (Object.keys(soundSources) as SoundKey[]).map(async (key) => {
      if (sounds[key]) return;
      const { sound } = await Audio.Sound.createAsync(soundSources[key], {
        shouldPlay: false,
        volume: 0.9,
      });
      sounds[key] = sound;
    }),
  );
}

export async function playSound(key: SoundKey): Promise<void> {
  await ensureAudioMode();
  if (!sounds[key]) {
    const { sound } = await Audio.Sound.createAsync(soundSources[key], {
      shouldPlay: false,
      volume: 0.9,
    });
    sounds[key] = sound;
  }
  const sound = sounds[key];
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Audio failures shouldn't block gameplay.
  }
}

export async function unloadSounds(): Promise<void> {
  await Promise.all(
    (Object.keys(sounds) as SoundKey[]).map(async (key) => {
      const sound = sounds[key];
      if (sound) {
        await sound.unloadAsync();
        delete sounds[key];
      }
    }),
  );
  audioModeReady = false;
}
