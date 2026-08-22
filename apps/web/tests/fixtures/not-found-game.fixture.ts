import {
  createInitialGameState,
  type GameState,
  type ObstacleState,
  type PlayerState,
  startGame,
} from "../../src/features/not-found-game/game-state.ts";

type GameStateOverrides = Partial<Omit<GameState, "status">>;

const values = {
  counts: {
    none: 0,
    one: 1,
    two: 2,
  },

  time: {
    quarterSecond: 0.25,
    halfSecond: 0.5,
    shortCollisionFrame: 0.01,
    advancedCollisionFrame: 0.1,
    negativeQuarterSecond: -0.25,
  },

  initial: {
    score: 0,
    highScore: 0,
    playerY: 0,
    playerVelocityY: 0,
  },

  player: {
    jumpVelocityY: -1,

    airborneClearanceY: -2,

    velocityAfterQuarterSecond: -0.5,
    yAfterQuarterSecond: -0.125,

    landingStartY: -0.1,
    landingStartVelocityY: 1,

    fallingCollisionStartY: -1.05,
    fallingCollisionStartVelocityY: 0.8,
    fallingCollisionExpectedY: -0.95,
  },

  obstacle: {
    defaultX: 10,
    defaultWidth: 1,
    defaultHeight: 1,

    xAfterHalfSecond: 8,

    passedStartX: 1,

    visibleStartX: 5,
    visibleExpectedX: 3,

    partiallyVisibleStartX: 1.75,
    partiallyVisibleExpectedX: -0.25,

    collisionX: 1,
    collisionStartX: 1.04,

    fallingCollisionStartX: 1.4,

    collisionFramePassedStartX: 0.5,
    collisionFrameCollidingStartX: 3,

    restartTestX: 4,

    invalidZeroDimension: 0,
    invalidNegativeDimension: -1,

    invalidX: {
      notANumber: Number.NaN,
      positiveInfinity: Number.POSITIVE_INFINITY,
      negativeInfinity: Number.NEGATIVE_INFINITY,
    },

    invalidId: {
      empty: "",
      whitespaceOnly: "   ",
    },

    spawn: {
      fullyOffScreenX: -1,
      partiallyVisibleX: -0.5,
    },
  },

  spawnCadence: {
    beforeThresholdDelta: 1,
    remainingThresholdDelta: 0.5,
    fullIntervalDelta: 1.5,

    elapsedBeforeThreshold: 1,
    elapsedAfterExactSpawn: 0,

    multipleSpawnDelta: 3.2,
    multipleSpawnCount: 2,
    multipleSpawnRemainder: 0.2,
  },

  generation: {
    obstacleId: "generated-obstacle",

    minimumSample: 0,
    midpointSample: 0.5,
    maximumSample: 1,

    spawnX: 12,
    width: 1,

    minimumHeight: 0.5,
    midpointHeight: 1,
    maximumHeight: 1.5,

    invalidSample: {
      belowMinimum: -0.1,
      aboveMaximum: 1.1,
      notANumber: Number.NaN,
      positiveInfinity: Number.POSITIVE_INFINITY,
      negativeInfinity: Number.NEGATIVE_INFINITY,
    },
  },

  score: {
    afterOnePassedObstacle: 1,

    restartTestScore: 7,

    previousHighScore: 3,
    newHighScore: 7,

    lowerCompletedRunScore: 3,
    existingHighScore: 7,
  },

  restart: {
    playerY: -0.5,
    playerVelocityY: 1,
  },
} as const;

function createPlayer(
  overrides: Partial<PlayerState> = {},
): PlayerState {
  return {
    y: values.initial.playerY,
    velocityY: values.initial.playerVelocityY,
    isGrounded: true,
    ...overrides,
  };
}

function createObstacle(
  overrides: Partial<ObstacleState> = {},
): ObstacleState {
  return {
    id: "obstacle",
    x: values.obstacle.defaultX,
    width: values.obstacle.defaultWidth,
    height: values.obstacle.defaultHeight,
    ...overrides,
  };
}

function createRunningState(
  overrides: GameStateOverrides = {},
): GameState {
  return {
    ...startGame(
      createInitialGameState(),
    ),
    ...overrides,
    status: "running",
  };
}

function createGameOverState(
  overrides: GameStateOverrides = {},
): GameState {
  return {
    ...createRunningState(overrides),
    status: "game-over",
  };
}

export const gameFixture = {
  values,
  createPlayer,
  createObstacle,
  createRunningState,
  createGameOverState,
} as const;
