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

Deno.test(
  "startNotFoundGameLoop: prevents stale frame callbacks after stop",
  () => {
    let scheduledFrame: FrameCallback | undefined;

    let requestCount = 0;
    let cancelCount = 0;

    let cancelledRequestId: number | undefined;

    let publishCount = 0;

    const controller = startNotFoundGameLoop(
      createNotFoundGameRuntimeState(),
      {
        requestFrame: (
          callback: FrameCallback,
        ) => {
          scheduledFrame = callback;
          requestCount += 1;

          return requestCount;
        },

        cancelFrame: (
          requestId: number,
        ) => {
          cancelCount += 1;

          cancelledRequestId = requestId;
        },

        getSpawnInputs: () => [],

        publishState: () => {
          publishCount += 1;
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

    expect.assert(
      scheduledFrame !== undefined,
      "First frame should schedule the next frame.",
    );

    const staleFrame = scheduledFrame;

    expect.equals(
      requestCount,
      fx.values.counts.two,
      "Expected exactly two frame requests before cleanup.",
    );

    controller.stop();

    expect.equals(
      cancelCount,
      fx.values.counts.one,
      "Stopping should cancel the pending frame request.",
    );

    expect.equals(
      cancelledRequestId,
      fx.values.counts.two,
      "Stopping should cancel the latest pending request.",
    );

    staleFrame(
      fx.values.frameClock
        .nextTimestampMs,
    );

    expect.equals(
      publishCount,
      fx.values.counts.none,
      "A stale frame callback should not publish runtime state.",
    );

    expect.equals(
      requestCount,
      fx.values.counts.two,
      "A stale frame callback should not schedule another frame.",
    );

    controller.stop();

    expect.equals(
      cancelCount,
      fx.values.counts.one,
      "Stopping more than once should not cancel again.",
    );
  },
);
