import {
  advanceFrameClock,
  createFrameClockState,
  type FrameClockState,
} from "./frame-clock.ts";

import {
  advanceNotFoundGameFrame,
  type NotFoundGameRuntimeState,
} from "./game-runtime.ts";

import type { ObstacleSpawnInput } from "./obstacle-spawner.ts";

export type NotFoundGameFrameCallback = (
  timestampMs: number,
) => void;

type NotFoundGameLoopDependencies = {
  readonly requestFrame: (
    callback: NotFoundGameFrameCallback,
  ) => number;

  readonly cancelFrame: (
    requestId: number,
  ) => void;

  readonly getSpawnInputs: () => readonly ObstacleSpawnInput[];

  readonly publishState: (
    state: NotFoundGameRuntimeState,
  ) => void;
};

export type NotFoundGameLoopController = {
  readonly stop: () => void;
};

export function startNotFoundGameLoop(
  initialState: NotFoundGameRuntimeState,
  dependencies: NotFoundGameLoopDependencies,
): NotFoundGameLoopController {
  let runtimeState = initialState;

  let frameClockState: FrameClockState = createFrameClockState();

  let requestId: number | null = null;
  let isActive = true;

  const handleFrame: NotFoundGameFrameCallback = (
    timestampMs,
  ) => {
    if (!isActive) {
      return;
    }

    const clockResult = advanceFrameClock(
      frameClockState,
      timestampMs,
    );

    frameClockState = clockResult.state;

    if (clockResult.deltaSeconds > 0) {
      runtimeState = advanceNotFoundGameFrame(
        runtimeState,
        clockResult.deltaSeconds,
        dependencies.getSpawnInputs(),
      );

      dependencies.publishState(
        runtimeState,
      );
    }

    if (isActive) {
      requestId = dependencies.requestFrame(
        handleFrame,
      );
    }
  };

  requestId = dependencies.requestFrame(
    handleFrame,
  );

  return {
    stop: () => {
      if (!isActive) {
        return;
      }

      isActive = false;

      if (requestId !== null) {
        dependencies.cancelFrame(
          requestId,
        );
      }
    },
  };
}
