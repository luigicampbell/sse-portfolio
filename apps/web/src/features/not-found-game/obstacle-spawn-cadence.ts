export type ObstacleSpawnCadenceState = {
  readonly elapsedSeconds: number;
};

export type ObstacleSpawnCadenceResult = {
  readonly state: ObstacleSpawnCadenceState;
  readonly spawnCount: number;
};

type ObstacleSpawnCadenceConfig = {
  readonly intervalSeconds: number;
};

const INITIAL_ELAPSED_SECONDS = 0;
const NO_SPAWNS = 0;
const SINGLE_SPAWN = 1;

const OBSTACLE_SPAWN_CADENCE = {
  intervalSeconds: 1.5,
} as const satisfies ObstacleSpawnCadenceConfig;

export function createObstacleSpawnCadenceState(): ObstacleSpawnCadenceState {
  return {
    elapsedSeconds: INITIAL_ELAPSED_SECONDS,
  };
}

export function advanceObstacleSpawnCadence(
  state: ObstacleSpawnCadenceState,
  deltaSeconds: number,
): ObstacleSpawnCadenceResult {
  const elapsedSeconds = state.elapsedSeconds +
    deltaSeconds;

  if (
    elapsedSeconds <
      OBSTACLE_SPAWN_CADENCE.intervalSeconds
  ) {
    return {
      state: {
        elapsedSeconds,
      },
      spawnCount: NO_SPAWNS,
    };
  }

  return {
    state: {
      elapsedSeconds: elapsedSeconds -
        OBSTACLE_SPAWN_CADENCE.intervalSeconds,
    },
    spawnCount: SINGLE_SPAWN,
  };
}
