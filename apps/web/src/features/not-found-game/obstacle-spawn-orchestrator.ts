import type { GameState, ObstacleState } from "./game-state.ts";

import { spawnObstacle } from "./game-state.ts";

import {
  advanceObstacleSpawner,
  createObstacleSpawnerState,
  type ObstacleSpawnerState,
  type ObstacleSpawnInput,
} from "./obstacle-spawner.ts";

export type ObstacleSpawningState = ObstacleSpawnerState;

export type ObstacleSpawningResult = {
  readonly gameState: GameState;
  readonly spawningState: ObstacleSpawningState;
};

export function createObstacleSpawningState(): ObstacleSpawningState {
  return createObstacleSpawnerState();
}

export function advanceObstacleSpawning(
  gameState: GameState,
  spawningState: ObstacleSpawningState,
  deltaSeconds: number,
  inputs: readonly ObstacleSpawnInput[],
): ObstacleSpawningResult {
  const spawnerResult = advanceObstacleSpawner(
    spawningState,
    deltaSeconds,
    inputs,
  );

  const nextGameState = addGeneratedObstacles(
    gameState,
    spawnerResult.obstacles,
  );

  return {
    gameState: nextGameState,
    spawningState: spawnerResult.state,
  };
}

function addGeneratedObstacles(
  gameState: GameState,
  obstacles: readonly ObstacleState[],
): GameState {
  return obstacles.reduce(
    (state, obstacle) =>
      spawnObstacle(
        state,
        obstacle,
      ),
    gameState,
  );
}
