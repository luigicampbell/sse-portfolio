export type GameStatus =
  | "ready"
  | "running"
  | "game-over";

export type PlayerState = {
  readonly y: number;
  readonly velocityY: number;
  readonly isGrounded: boolean;
};

export type ObstacleState = {
  readonly id: string;
  readonly x: number;
  readonly width: number;
  readonly height: number;
};

export type GameState = {
  readonly status: GameStatus;
  readonly score: number;
  readonly highScore: number;
  readonly player: PlayerState;
  readonly obstacles: readonly ObstacleState[];
};

type PlayerHitbox = {
  readonly x: number;
  readonly width: number;
  readonly height: number;
};

type GamePhysicsConfig = {
  readonly groundY: number;
  readonly worldLeftX: number;
  readonly jumpVelocity: number;
  readonly gravity: number;
  readonly obstacleSpeed: number;
  readonly scorePerPassedObstacle: number;
  readonly playerHitbox: PlayerHitbox;
};

type ObstacleStepResult = {
  readonly activeObstacles: readonly ObstacleState[];
  readonly passedObstacleCount: number;
};

type VerticalMotion = {
  readonly y: number;
  readonly velocityY: number;
};

type CollisionBounds = {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
};

const INITIAL_SCORE = 0;
const INITIAL_HIGH_SCORE = 0;
const RESTING_VERTICAL_VELOCITY = 0;

const GAME_PHYSICS = {
  groundY: 0,
  worldLeftX: 0,
  jumpVelocity: -1,
  gravity: 2,
  obstacleSpeed: 4,
  scorePerPassedObstacle: 1,
  playerHitbox: {
    x: 1,
    width: 1,
    height: 1,
  },
} as const satisfies GamePhysicsConfig;

export function createInitialGameState(): GameState {
  return {
    status: "ready",
    score: INITIAL_SCORE,
    highScore: INITIAL_HIGH_SCORE,
    player: createInitialPlayerState(),
    obstacles: [],
  };
}

function createRestartedGameState(
  state: GameState,
): GameState {
  return {
    ...createInitialGameState(),
    highScore: state.highScore,
  };
}

export function startGame(
  state: GameState,
): GameState {
  if (!canStartGame(state)) {
    return state;
  }

  return {
    ...state,
    status: "running",
  };
}

export function restartGame(
  state: GameState,
): GameState {
  if (!canRestartGame(state)) {
    return state;
  }

  return createRestartedGameState(state);
}

export function jumpPlayer(
  state: GameState,
): GameState {
  if (!canJump(state)) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      velocityY: GAME_PHYSICS.jumpVelocity,
      isGrounded: false,
    },
  };
}

export function stepGame(
  state: GameState,
  deltaSeconds: number,
): GameState {
  if (!canAdvanceGame(state, deltaSeconds)) {
    return state;
  }

  const obstacleStep = advanceObstacles(
    state.obstacles,
    deltaSeconds,
  );

  const nextPlayer = advancePlayer(
    state.player,
    deltaSeconds,
  );

  if (
    hasAnyCollision(
      nextPlayer,
      obstacleStep.activeObstacles,
    )
  ) {
    return createCollisionState(
      state,
      nextPlayer,
      obstacleStep.activeObstacles,
    );
  }

  const nextScore = calculateScore(
    state.score,
    obstacleStep.passedObstacleCount,
  );

  return {
    ...state,
    score: nextScore,
    player: nextPlayer,
    obstacles: obstacleStep.activeObstacles,
  };
}

export function spawnObstacle(
  state: GameState,
  obstacle: ObstacleState,
): GameState {
  if (!isGameRunning(state)) {
    return state;
  }

  return {
    ...state,
    obstacles: [
      ...state.obstacles,
      {
        ...obstacle,
      },
    ],
  };
}

export function hasCollision(
  player: PlayerState,
  obstacle: ObstacleState,
): boolean {
  return boundsOverlap(
    getPlayerBounds(player),
    getObstacleBounds(obstacle),
  );
}

function createInitialPlayerState(): PlayerState {
  return {
    y: GAME_PHYSICS.groundY,
    velocityY: RESTING_VERTICAL_VELOCITY,
    isGrounded: true,
  };
}

function createCollisionState(
  state: GameState,
  player: PlayerState,
  obstacles: readonly ObstacleState[],
): GameState {
  return {
    ...state,
    status: "game-over",
    highScore: calculateHighScore(
      state.score,
      state.highScore,
    ),
    player,
    obstacles,
  };
}

function canStartGame(
  state: GameState,
): boolean {
  return state.status === "ready";
}

function canRestartGame(
  state: GameState,
): boolean {
  return state.status === "game-over";
}

function canJump(
  state: GameState,
): boolean {
  return isGameRunning(state) &&
    state.player.isGrounded;
}

function canAdvanceGame(
  state: GameState,
  deltaSeconds: number,
): boolean {
  return isGameRunning(state) &&
    isValidDeltaSeconds(deltaSeconds);
}

function isGameRunning(
  state: GameState,
): boolean {
  return state.status === "running";
}

function isValidDeltaSeconds(
  deltaSeconds: number,
): boolean {
  return Number.isFinite(deltaSeconds) &&
    deltaSeconds > 0;
}

function advanceObstacles(
  obstacles: readonly ObstacleState[],
  deltaSeconds: number,
): ObstacleStepResult {
  const activeObstacles: ObstacleState[] = [];
  let passedObstacleCount = 0;

  for (const obstacle of obstacles) {
    const movedObstacle = moveObstacle(
      obstacle,
      deltaSeconds,
    );

    if (isObstacleOffScreen(movedObstacle)) {
      passedObstacleCount += 1;
      continue;
    }

    activeObstacles.push(movedObstacle);
  }

  return {
    activeObstacles,
    passedObstacleCount,
  };
}

function moveObstacle(
  obstacle: ObstacleState,
  deltaSeconds: number,
): ObstacleState {
  const horizontalDistance = calculateObstacleTravelDistance(
    deltaSeconds,
  );

  return {
    ...obstacle,
    x: obstacle.x - horizontalDistance,
  };
}

function calculateObstacleTravelDistance(
  deltaSeconds: number,
): number {
  return GAME_PHYSICS.obstacleSpeed *
    deltaSeconds;
}

function getObstacleRightEdge(
  obstacle: ObstacleState,
): number {
  return obstacle.x + obstacle.width;
}

function isObstacleOffScreen(
  obstacle: ObstacleState,
): boolean {
  return getObstacleRightEdge(obstacle) <=
    GAME_PHYSICS.worldLeftX;
}

function calculateScore(
  currentScore: number,
  passedObstacleCount: number,
): number {
  const earnedScore = passedObstacleCount *
    GAME_PHYSICS.scorePerPassedObstacle;

  return currentScore + earnedScore;
}

function calculateHighScore(
  currentScore: number,
  highScore: number,
): number {
  return Math.max(
    currentScore,
    highScore,
  );
}

function advancePlayer(
  player: PlayerState,
  deltaSeconds: number,
): PlayerState {
  if (player.isGrounded) {
    return player;
  }

  const motion = calculateVerticalMotion(
    player,
    deltaSeconds,
  );

  if (hasReachedGround(motion.y)) {
    return landPlayer(player);
  }

  return {
    ...player,
    ...motion,
  };
}

function calculateVerticalMotion(
  player: PlayerState,
  deltaSeconds: number,
): VerticalMotion {
  const velocityY = applyGravity(
    player.velocityY,
    deltaSeconds,
  );

  const y = moveVertically(
    player.y,
    velocityY,
    deltaSeconds,
  );

  return {
    y,
    velocityY,
  };
}

function applyGravity(
  velocityY: number,
  deltaSeconds: number,
): number {
  const gravityAcceleration = GAME_PHYSICS.gravity *
    deltaSeconds;

  return velocityY +
    gravityAcceleration;
}

function moveVertically(
  y: number,
  velocityY: number,
  deltaSeconds: number,
): number {
  const verticalDistance = velocityY * deltaSeconds;

  return y + verticalDistance;
}

function hasReachedGround(
  y: number,
): boolean {
  return y >= GAME_PHYSICS.groundY;
}

function landPlayer(
  player: PlayerState,
): PlayerState {
  return {
    ...player,
    y: GAME_PHYSICS.groundY,
    velocityY: RESTING_VERTICAL_VELOCITY,
    isGrounded: true,
  };
}

function hasAnyCollision(
  player: PlayerState,
  obstacles: readonly ObstacleState[],
): boolean {
  return obstacles.some(
    (obstacle) => hasCollision(player, obstacle),
  );
}

function getPlayerBounds(
  player: PlayerState,
): CollisionBounds {
  const hitbox = GAME_PHYSICS.playerHitbox;

  return {
    left: hitbox.x,
    right: hitbox.x + hitbox.width,
    top: player.y - hitbox.height,
    bottom: player.y,
  };
}

function getObstacleBounds(
  obstacle: ObstacleState,
): CollisionBounds {
  return {
    left: obstacle.x,
    right: getObstacleRightEdge(obstacle),
    top: GAME_PHYSICS.groundY -
      obstacle.height,
    bottom: GAME_PHYSICS.groundY,
  };
}

function boundsOverlap(
  first: CollisionBounds,
  second: CollisionBounds,
): boolean {
  return (
    overlapsHorizontally(first, second) &&
    overlapsVertically(first, second)
  );
}

function overlapsHorizontally(
  first: CollisionBounds,
  second: CollisionBounds,
): boolean {
  return (
    first.right > second.left &&
    first.left < second.right
  );
}

function overlapsVertically(
  first: CollisionBounds,
  second: CollisionBounds,
): boolean {
  return (
    first.bottom > second.top &&
    first.top < second.bottom
  );
}
