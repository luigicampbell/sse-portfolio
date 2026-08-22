export type FrameClockState = {
  readonly previousTimestampMs: number | null;
};

export type FrameClockResult = {
  readonly state: FrameClockState;
  readonly deltaSeconds: number;
};

type FrameClockConfig = {
  readonly millisecondsPerSecond: number;
  readonly maximumDeltaSeconds: number;
};

const INITIAL_TIMESTAMP = null;
const NO_DELTA_SECONDS = 0;

const FRAME_CLOCK = {
  millisecondsPerSecond: 1000,
  maximumDeltaSeconds: 0.1,
} as const satisfies FrameClockConfig;

export function createFrameClockState(): FrameClockState {
  return {
    previousTimestampMs: INITIAL_TIMESTAMP,
  };
}

export function advanceFrameClock(
  state: FrameClockState,
  timestampMs: number,
): FrameClockResult {
  if (!isValidTimestamp(timestampMs)) {
    return createNoAdvanceResult(state);
  }

  if (state.previousTimestampMs === null) {
    return {
      state: {
        previousTimestampMs: timestampMs,
      },
      deltaSeconds: NO_DELTA_SECONDS,
    };
  }

  if (
    timestampMs <=
      state.previousTimestampMs
  ) {
    return createNoAdvanceResult(state);
  }

  const elapsedMilliseconds = timestampMs -
    state.previousTimestampMs;

  const elapsedSeconds = elapsedMilliseconds /
    FRAME_CLOCK.millisecondsPerSecond;

  return {
    state: {
      previousTimestampMs: timestampMs,
    },
    deltaSeconds: Math.min(
      elapsedSeconds,
      FRAME_CLOCK.maximumDeltaSeconds,
    ),
  };
}

function isValidTimestamp(
  timestampMs: number,
): boolean {
  return Number.isFinite(timestampMs);
}

function createNoAdvanceResult(
  state: FrameClockState,
): FrameClockResult {
  return {
    state,
    deltaSeconds: NO_DELTA_SECONDS,
  };
}
