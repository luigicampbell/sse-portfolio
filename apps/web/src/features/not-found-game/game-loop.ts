import {
  advanceFrameClock,
  createFrameClockState,
  type FrameClockState,
} from "./frame-clock.ts";

import {
  advanceNotFoundGameFrame,
  type NotFoundGameRuntimeState,
} from "./game-runtime.ts";

import type { ObstacleSpawnInputProvider } from "./obstacle-spawner.ts";

export type NotFoundGameFrameCallback = (
  timestampMs: number,
) => void;

export type NotFoundGameLoopDependencies = {
  readonly requestFrame: (
    callback: NotFoundGameFrameCallback,
  ) => number;

  readonly cancelFrame: (
    requestId: number,
  ) => void;

  readonly getSpawnInputs: ObstacleSpawnInputProvider;

  readonly publishState: (
    state: NotFoundGameRuntimeState,
  ) => void;
};

export type NotFoundGameRuntimeUpdater = (
  state: NotFoundGameRuntimeState,
) => NotFoundGameRuntimeState;

export type NotFoundGameLoopController = {
  readonly updateRuntimeState: (
    update: NotFoundGameRuntimeUpdater,
  ) => void;

  readonly setPaused: (
    isPaused: boolean,
  ) => void;

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
  let isPaused = false;

  const handleFrame: NotFoundGameFrameCallback = (
    timestampMs,
  ) => {
    if (
      !isActive ||
      isPaused
    ) {
      return;
    }

    const clockResult = advanceFrameClock(
      frameClockState,
      timestampMs,
    );

    frameClockState = clockResult.state;

    if (
      clockResult.deltaSeconds >
        0
    ) {
      runtimeState = advanceNotFoundGameFrame(
        runtimeState,
        clockResult.deltaSeconds,
        dependencies.getSpawnInputs,
      );

      dependencies.publishState(
        runtimeState,
      );
    }

    if (
      isActive &&
      !isPaused
    ) {
      requestId = dependencies.requestFrame(
        handleFrame,
      );
    }
  };

  requestId = dependencies.requestFrame(
    handleFrame,
  );

  return {
    updateRuntimeState: (
      update: NotFoundGameRuntimeUpdater,
    ): void => {
      if (!isActive) {
        return;
      }

      const nextRuntimeState = update(runtimeState);

      if (
        nextRuntimeState ===
          runtimeState
      ) {
        return;
      }

      runtimeState = nextRuntimeState;

      dependencies.publishState(
        runtimeState,
      );
    },

    setPaused: (
      nextIsPaused: boolean,
    ): void => {
      if (
        !isActive ||
        nextIsPaused ===
          isPaused
      ) {
        return;
      }

      isPaused = nextIsPaused;

      if (isPaused) {
        if (
          requestId !==
            null
        ) {
          dependencies.cancelFrame(
            requestId,
          );

          requestId = null;
        }

        return;
      }

      frameClockState = createFrameClockState();

      requestId = dependencies.requestFrame(
        handleFrame,
      );
    },

    stop: (): void => {
      if (!isActive) {
        return;
      }

      isActive = false;

      if (
        requestId !==
          null
      ) {
        dependencies.cancelFrame(
          requestId,
        );

        requestId = null;
      }
    },
  };
}
