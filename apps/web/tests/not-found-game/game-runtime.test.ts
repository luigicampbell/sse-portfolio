import {
  advanceNotFoundGameFrame,
  createNotFoundGameRuntimeState,
} from "../../src/features/not-found-game/game-runtime.ts";

import { gameFixture as fx } from "../fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

Deno.test(
  "advanceNotFoundGameFrame: advances physics and spawning with the same frame delta",
  () => {
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

    const nextState = advanceNotFoundGameFrame(
      initialState,
      fx.values.spawnCadence
        .fullIntervalDelta,
      [
        {
          id: fx.values.generation
            .obstacleId,
          normalizedSample: fx.values.generation
            .midpointSample,
        },
      ],
    );

    expect.equals(
      nextState.gameState.obstacles.length,
      fx.values.counts.two,
      "Frame should retain the existing obstacle and add the due obstacle.",
    );

    const existingObstacle = nextState.gameState.obstacles.find(
      (obstacle) =>
        obstacle.id ===
          "existing-obstacle",
    );

    const generatedObstacle = nextState.gameState.obstacles.find(
      (obstacle) =>
        obstacle.id ===
          fx.values.generation
            .obstacleId,
    );

    expect.assert(
      existingObstacle !== undefined,
      "Expected existing obstacle to remain.",
    );

    expect.assert(
      generatedObstacle !== undefined,
      "Expected generated obstacle to be added.",
    );

    expect.approximatelyEquals(
      existingObstacle.x,
      fx.values.obstacle
        .xAfterFullSpawnInterval,
      "Existing obstacle should advance using the frame delta.",
    );

    expect.equals(
      generatedObstacle.x,
      fx.values.generation.spawnX,
      "New obstacle should enter at the spawn position after game advancement.",
    );

    expect.approximatelyEquals(
      nextState.spawningState
        .cadence.elapsedSeconds,
      fx.values.spawnCadence
        .elapsedAfterExactSpawn,
      "Spawn cadence should consume the same frame delta.",
    );
  },
);
