import {
  createInitialGameState,
  type GameState,
  stepGame,
} from "./game-state.ts";

import {
  advanceObstacleSpawning,
  createObstacleSpawningState,
  type ObstacleSpawningState,
} from "./obstacle-spawn-orchestrator.ts";

import type { ObstacleSpawnInput } from "./obstacle-spawner.ts";

export type NotFoundGameRuntimeState = {
  readonly gameState: GameState;
  readonly spawningState: ObstacleSpawningState;
};

export function createNotFoundGameRuntimeState(): NotFoundGameRuntimeState {
  return {
    gameState: createInitialGameState(),
    spawningState: createObstacleSpawningState(),
  };
}

export function advanceNotFoundGameFrame(
  state: NotFoundGameRuntimeState,
  deltaSeconds: number,
  inputs: readonly ObstacleSpawnInput[],
): NotFoundGameRuntimeState {
  const steppedGameState = stepGame(
    state.gameState,
    deltaSeconds,
  );

  const spawningResult = advanceObstacleSpawning(
    steppedGameState,
    state.spawningState,
    deltaSeconds,
    inputs,
  );

  return {
    gameState: spawningResult.gameState,
    spawningState: spawningResult.spawningState,
  };
}
