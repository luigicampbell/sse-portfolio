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
  if (!isValidDeltaSeconds(deltaSeconds)) {
    return {
      state,
      spawnCount: 0,
    };
  }

  const elapsedSeconds = state.elapsedSeconds +
    deltaSeconds;

  const spawnCount = calculateSpawnCount(
    elapsedSeconds,
  );

  const remainingElapsedSeconds = calculateRemainingElapsedSeconds(
    elapsedSeconds,
    spawnCount,
  );

  return {
    state: {
      elapsedSeconds: remainingElapsedSeconds,
    },
    spawnCount,
  };
}

function isValidDeltaSeconds(
  deltaSeconds: number,
): boolean {
  return Number.isFinite(deltaSeconds) &&
    deltaSeconds > 0;
}

function calculateSpawnCount(
  elapsedSeconds: number,
): number {
  return Math.floor(
    elapsedSeconds /
      OBSTACLE_SPAWN_CADENCE.intervalSeconds,
  );
}

function calculateRemainingElapsedSeconds(
  elapsedSeconds: number,
  spawnCount: number,
): number {
  return elapsedSeconds -
    spawnCount *
      OBSTACLE_SPAWN_CADENCE.intervalSeconds;
}
