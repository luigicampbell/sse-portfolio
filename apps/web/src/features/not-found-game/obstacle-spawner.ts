import type { ObstacleState } from "./game-state.ts";

import { generateObstacle } from "./obstacle-generator.ts";

import {
  advanceObstacleSpawnCadence,
  createObstacleSpawnCadenceState,
  type ObstacleSpawnCadenceState,
} from "./obstacle-spawn-cadence.ts";

export type ObstacleSpawnInput = {
  readonly id: string;
  readonly normalizedSample: number;
};

export type ObstacleSpawnInputProvider = (
  spawnCount: number,
) => readonly ObstacleSpawnInput[];

export type ObstacleSpawnerState = {
  readonly cadence: ObstacleSpawnCadenceState;
};

export type ObstacleSpawnerResult = {
  readonly state: ObstacleSpawnerState;
  readonly obstacles: readonly ObstacleState[];
};

export function createObstacleSpawnerState(): ObstacleSpawnerState {
  return {
    cadence: createObstacleSpawnCadenceState(),
  };
}

export function advanceObstacleSpawner(
  state: ObstacleSpawnerState,
  deltaSeconds: number,
  getInputs: ObstacleSpawnInputProvider,
): ObstacleSpawnerResult {
  const cadenceResult = advanceObstacleSpawnCadence(
    state.cadence,
    deltaSeconds,
  );

  if (cadenceResult.spawnCount === 0) {
    return {
      state: {
        cadence: cadenceResult.state,
      },
      obstacles: [],
    };
  }

  const inputs = getInputs(
    cadenceResult.spawnCount,
  );

  validateSpawnInputCount(
    cadenceResult.spawnCount,
    inputs.length,
  );

  const spawnInputs = inputs.slice(
    0,
    cadenceResult.spawnCount,
  );

  const obstacles = spawnInputs.map(
    (input) =>
      generateObstacle(
        input.id,
        input.normalizedSample,
      ),
  );

  return {
    state: {
      cadence: cadenceResult.state,
    },
    obstacles,
  };
}

function validateSpawnInputCount(
  spawnCount: number,
  inputCount: number,
): void {
  if (inputCount < spawnCount) {
    throw new RangeError(
      `Obstacle spawner requires ${spawnCount} inputs but received ${inputCount}.`,
    );
  }
}
