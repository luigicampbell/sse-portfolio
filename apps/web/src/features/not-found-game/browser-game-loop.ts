import type { NotFoundGameLoopDependencies } from "./game-loop.ts";

import type { NotFoundGameRuntimeState } from "./game-runtime.ts";

import type { ObstacleSpawnInputProvider } from "./obstacle-spawner.ts";

import {
  createBrowserObstacleSpawnInputProvider,
} from "./runtime-spawn-inputs.ts";

type BrowserFrameCallback = (
  timestampMs: number,
) => void;

type BrowserAnimationScheduler = {
  readonly requestAnimationFrame: (
    callback: BrowserFrameCallback,
  ) => number;

  readonly cancelAnimationFrame: (
    requestId: number,
  ) => void;
};

type RuntimeStatePublisher = (
  state: NotFoundGameRuntimeState,
) => void;

export function createBrowserGameLoopDependencies(
  publishState: RuntimeStatePublisher,
  scheduler: BrowserAnimationScheduler = globalThis,
  getSpawnInputs: ObstacleSpawnInputProvider =
    createBrowserObstacleSpawnInputProvider(),
): NotFoundGameLoopDependencies {
  return {
    requestFrame: (
      callback,
    ) =>
      scheduler.requestAnimationFrame(
        callback,
      ),

    cancelFrame: (
      requestId,
    ) =>
      scheduler.cancelAnimationFrame(
        requestId,
      ),

    getSpawnInputs,

    publishState,
  };
}
