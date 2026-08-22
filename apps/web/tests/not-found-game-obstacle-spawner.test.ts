import {
  advanceObstacleSpawner,
  createObstacleSpawnerState,
} from "../src/features/not-found-game/obstacle-spawner.ts";

import { gameFixture as fx } from "./fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "./helpers/assertions.ts";

Deno.test(
  "advanceObstacleSpawner: produces one obstacle when one spawn becomes due",
  () => {
    const state = createObstacleSpawnerState();

    const result = advanceObstacleSpawner(
      state,
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
      result.obstacles.length,
      fx.values.counts.one,
      "Exactly one obstacle should be generated for one due spawn.",
    );

    const obstacle = result.obstacles[0];

    expect.assert(
      obstacle !== undefined,
      "Expected generated obstacle to exist.",
    );

    expect.equals(
      obstacle.id,
      fx.values.generation.obstacleId,
      "Generated obstacle should preserve the supplied id.",
    );

    expect.equals(
      obstacle.height,
      fx.values.generation.midpointHeight,
      "Generated obstacle should use the supplied normalized sample.",
    );

    expect.equals(
      result.state.cadence.elapsedSeconds,
      fx.values.spawnCadence
        .elapsedAfterExactSpawn,
      "Spawner should preserve the advanced cadence state.",
    );
  },
);

Deno.test(
  "advanceObstacleSpawner: rejects insufficient inputs for due spawns",
  () => {
    const state = createObstacleSpawnerState();

    expect.throws(
      () => {
        advanceObstacleSpawner(
          state,
          fx.values.spawnCadence
            .multipleSpawnDelta,
          [
            {
              id: fx.values.generation
                .obstacleId,
              normalizedSample: fx.values.generation
                .midpointSample,
            },
          ],
        );
      },
      RangeError,
      "Spawner should reject fewer inputs than the number of due spawns.",
    );
  },
);
