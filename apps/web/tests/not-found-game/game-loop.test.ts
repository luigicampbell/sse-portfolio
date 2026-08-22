import {
  startNotFoundGameLoop,
} from "../../src/features/not-found-game/game-loop.ts";

import {
  createNotFoundGameRuntimeState,
  type NotFoundGameRuntimeState,
} from "../../src/features/not-found-game/game-runtime.ts";

import { gameFixture as fx } from "../fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

type FrameCallback = (
  timestampMs: number,
) => void;

Deno.test(
  "startNotFoundGameLoop: initializes on the first frame and advances the runtime on the next frame",
  () => {
    let scheduledFrame: FrameCallback | undefined;

    const publishedStates: NotFoundGameRuntimeState[] = [];

    const initialState = {
      ...createNotFoundGameRuntimeState(),
      gameState: fx.createRunningState({
        obstacles: [
          fx.createObstacle({
            id: "existing-obstacle",
          }),
        ],
      }),
    };

    const controller = startNotFoundGameLoop(
      initialState,
      {
        requestFrame: (
          callback: FrameCallback,
        ) => {
          scheduledFrame = callback;
          return 1;
        },

        cancelFrame: (
          _requestId: number,
        ) => {},

        getSpawnInputs: () => [],

        publishState: (
          state: NotFoundGameRuntimeState,
        ) => {
          publishedStates.push(state);
        },
      },
    );

    expect.assert(
      scheduledFrame !== undefined,
      "Starting the loop should schedule the first frame.",
    );

    const firstFrame = scheduledFrame;

    firstFrame(
      fx.values.frameClock
        .firstTimestampMs,
    );

    expect.equals(
      publishedStates.length,
      fx.values.counts.none,
      "First timestamp should initialize the clock without publishing an advanced state.",
    );

    expect.assert(
      scheduledFrame !== undefined,
      "First frame should schedule another frame.",
    );

    const secondFrame = scheduledFrame;

    secondFrame(
      fx.values.frameClock
        .nextTimestampMs,
    );

    expect.equals(
      publishedStates.length,
      fx.values.counts.one,
      "Second timestamp should publish one advanced runtime state.",
    );

    const publishedState = publishedStates[0];

    expect.assert(
      publishedState !== undefined,
      "Expected an advanced runtime state.",
    );

    const obstacle = publishedState.gameState
      .obstacles[0];

    expect.assert(
      obstacle !== undefined,
      "Expected existing obstacle to remain.",
    );

    expect.approximatelyEquals(
      obstacle.x,
      fx.values.obstacle
        .xAfterSixteenMilliseconds,
      "Game runtime should advance using the frame-clock delta.",
    );

    controller.stop();
  },
);

Deno.test(
  "startNotFoundGameLoop: does not request spawn inputs when no spawn is due",
  () => {
    let scheduledFrame: FrameCallback | undefined;

    let spawnInputRequestCount = 0;

    const controller = startNotFoundGameLoop(
      {
        ...createNotFoundGameRuntimeState(),
        gameState: fx.createRunningState(),
      },
      {
        requestFrame: (
          callback: FrameCallback,
        ) => {
          scheduledFrame = callback;
          return 1;
        },

        cancelFrame: (
          _requestId: number,
        ) => {},

        getSpawnInputs: () => {
          spawnInputRequestCount += 1;
          return [];
        },

        publishState: () => {},
      },
    );

    expect.assert(
      scheduledFrame !== undefined,
      "Starting the loop should schedule the first frame.",
    );

    const firstFrame = scheduledFrame;

    firstFrame(
      fx.values.frameClock
        .firstTimestampMs,
    );

    expect.assert(
      scheduledFrame !== undefined,
      "First frame should schedule another frame.",
    );

    const secondFrame = scheduledFrame;

    secondFrame(
      fx.values.frameClock
        .nextTimestampMs,
    );

    expect.equals(
      spawnInputRequestCount,
      fx.values.counts.none,
      "Spawn inputs should not be requested when no spawn is due.",
    );

    controller.stop();
  },
);
