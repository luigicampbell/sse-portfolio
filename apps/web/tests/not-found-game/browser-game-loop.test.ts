import {
  createBrowserGameLoopDependencies,
  tryStartBrowserGameLoop,
} from "../../src/features/not-found-game/browser-game-loop.ts";

import {
  createNotFoundGameRuntimeState,
  type NotFoundGameRuntimeState,
} from "../../src/features/not-found-game/game-runtime.ts";

import type {
  ObstacleSpawnInputProvider,
} from "../../src/features/not-found-game/obstacle-spawner.ts";

import { gameFixture as fx } from "../fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

type FrameCallback = (
  timestampMs: number,
) => void;

Deno.test(
  "createBrowserGameLoopDependencies: adapts browser scheduling and runtime dependencies",
  () => {
    let scheduledFrame: FrameCallback | undefined;

    let cancelledRequestId: number | undefined;

    let publishedState: NotFoundGameRuntimeState | undefined;

    const scheduler = {
      requestAnimationFrame: (
        callback: FrameCallback,
      ): number => {
        scheduledFrame = callback;

        return fx.values.browserRuntime
          .requestId;
      },

      cancelAnimationFrame: (
        requestId: number,
      ): void => {
        cancelledRequestId = requestId;
      },
    };

    const getSpawnInputs: ObstacleSpawnInputProvider = () => [];

    const dependencies = createBrowserGameLoopDependencies(
      (
        state: NotFoundGameRuntimeState,
      ) => {
        publishedState = state;
      },
      scheduler,
      getSpawnInputs,
    );

    const requestId = dependencies.requestFrame(
      () => {},
    );

    expect.equals(
      requestId,
      fx.values.browserRuntime.requestId,
      "Browser adapter should preserve the animation-frame request id.",
    );

    expect.assert(
      scheduledFrame !== undefined,
      "Browser adapter should forward the frame callback.",
    );

    dependencies.cancelFrame(
      requestId,
    );

    expect.equals(
      cancelledRequestId,
      fx.values.browserRuntime.requestId,
      "Browser adapter should forward animation-frame cancellation.",
    );

    expect.sameReference(
      dependencies.getSpawnInputs,
      getSpawnInputs,
      "Browser adapter should preserve the spawn-input provider.",
    );

    const runtimeState = createNotFoundGameRuntimeState();

    dependencies.publishState(
      runtimeState,
    );

    expect.assert(
      publishedState !== undefined,
      "Browser adapter should publish a runtime state.",
    );

    expect.sameReference(
      publishedState,
      runtimeState,
      "Browser adapter should publish runtime state unchanged.",
    );
  },
);

Deno.test(
  "tryStartBrowserGameLoop: returns null when the animation loop cannot start",
  () => {
    const scheduler = {
      requestAnimationFrame: (
        _callback: FrameCallback,
      ): number => {
        throw new Error(
          "Animation scheduler unavailable.",
        );
      },

      cancelAnimationFrame: (
        _requestId: number,
      ): void => {},
    };

    const dependencies = createBrowserGameLoopDependencies(
      () => {},
      scheduler,
      () => [],
    );

    const controller = tryStartBrowserGameLoop(
      createNotFoundGameRuntimeState(),
      dependencies,
    );

    expect.equals(
      controller,
      null,
      "Browser integration should degrade safely when the game loop cannot start.",
    );
  },
);
