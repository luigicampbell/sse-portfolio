import {
  advanceObstacleSpawning,
  createObstacleSpawningState,
} from "../src/features/not-found-game/obstacle-spawn-orchestrator.ts";
import {
  createInitialGameState,
} from "../src/features/not-found-game/game-state.ts";
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

Deno.test(
  "advanceObstacleSpawning: non-running games do not consume spawn cadence",
  () => {
    const cases = [
      {
        name: "ready",
        gameState: createInitialGameState(),
      },
      {
        name: "game-over",
        gameState: fx.createGameOverState(),
      },
    ] as const;

    for (const testCase of cases) {
      const spawningState = createObstacleSpawningState();

      const result = advanceObstacleSpawning(
        testCase.gameState,
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

      expect.sameReference(
        result.gameState,
        testCase.gameState,
        `${testCase.name} game should preserve its game state.`,
      );

      expect.sameReference(
        result.spawningState,
        spawningState,
        `${testCase.name} game should not consume spawn cadence.`,
      );

      expect.equals(
        result.gameState.obstacles.length,
        fx.values.counts.none,
        `${testCase.name} game should not spawn obstacles.`,
      );
    }
  },
);
