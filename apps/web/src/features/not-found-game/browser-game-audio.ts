import type { NotFoundGameSoundEffect } from "./game-audio.ts";

type Tone = {
  readonly frequency: number;
  readonly durationSeconds: number;
};

const EFFECT_TONES = {
  start: [
    {
      frequency: 440,
      durationSeconds: 0.06,
    },
    {
      frequency: 660,
      durationSeconds: 0.08,
    },
  ],

  jump: [
    {
      frequency: 620,
      durationSeconds: 0.08,
    },
  ],

  score: [
    {
      frequency: 880,
      durationSeconds: 0.06,
    },
  ],

  "game-over": [
    {
      frequency: 220,
      durationSeconds: 0.1,
    },
    {
      frequency: 165,
      durationSeconds: 0.14,
    },
  ],
} as const satisfies Record<
  NotFoundGameSoundEffect,
  readonly Tone[]
>;

const TONE_GAP_SECONDS = 0.015;
const GAIN = 0.045;

let audioContext: AudioContext | null = null;

export function playNotFoundGameSoundEffect(
  effect: NotFoundGameSoundEffect,
): void {
  const context = getAudioContext();

  if (context === null) {
    return;
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  let startTime = context.currentTime;

  for (
    const tone of EFFECT_TONES[effect]
  ) {
    playTone(
      context,
      tone,
      startTime,
    );

    startTime += tone.durationSeconds +
      TONE_GAP_SECONDS;
  }
}

function getAudioContext(): AudioContext | null {
  if (audioContext !== null) {
    return audioContext;
  }

  if (
    typeof globalThis.AudioContext !==
      "function"
  ) {
    return null;
  }

  try {
    audioContext = new globalThis.AudioContext();

    return audioContext;
  } catch {
    return null;
  }
}

function playTone(
  context: AudioContext,
  tone: Tone,
  startTime: number,
): void {
  const oscillator = context.createOscillator();

  const gain = context.createGain();

  const stopTime = startTime +
    tone.durationSeconds;

  oscillator.type = "square";

  oscillator.frequency.setValueAtTime(
    tone.frequency,
    startTime,
  );

  gain.gain.setValueAtTime(
    GAIN,
    startTime,
  );

  gain.gain.setValueAtTime(
    GAIN,
    stopTime - 0.01,
  );

  gain.gain.linearRampToValueAtTime(
    0,
    stopTime,
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(stopTime);
}
