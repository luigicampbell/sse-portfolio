import {
  advanceObstacleSpawning,
  createObstacleSpawningState,
} from "../src/features/not-found-game/obstacle-spawn-orchestrator.ts";

import { gameFixture as fx } from "./fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "./helpers/assertions.ts";

Deno.test(
  "advanceObstacleSpawning: adds a due generated obstacle to a running game",
  () => {
    const gameState = fx.createRunningState();

    const spawningState = createObstacleSpawningState();

    const result = advanceObstacleSpawning(
      gameState,
      spawningState,
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
      result.gameState.obstacles.length,
      fx.values.counts.one,
      "Due generated obstacle should enter the running game.",
    );

    const obstacle = result.gameState.obstacles[0];

    expect.assert(
      obstacle !== undefined,
      "Expected spawned obstacle to exist.",
    );

    expect.equals(
      obstacle.id,
      fx.values.generation.obstacleId,
      "Spawned obstacle should preserve the generated id.",
    );

    expect.equals(
      obstacle.height,
      fx.values.generation.midpointHeight,
      "Spawned obstacle should preserve generated geometry.",
    );
  },
);
