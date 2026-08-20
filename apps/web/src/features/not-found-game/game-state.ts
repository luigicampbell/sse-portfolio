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
  readonly jumpVelocity: number;
  readonly gravity: number;
  readonly obstacleSpeed: number;
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

const GAME_PHYSICS = {
  groundY: 0,
  jumpVelocity: -1,
  gravity: 2,
  obstacleSpeed: 4,
  playerHitbox: {
    x: 1,
    width: 1,
    height: 1,
  },
} as const satisfies GamePhysicsConfig;

export function createInitialGameState(): GameState {
  return {
    status: "ready",
    score: 0,
    player: createInitialPlayerState(),
    obstacles: [],
  };
}

export function startGame(
  state: GameState,
): GameState {
  return {
    ...state,
    status: "running",
  };
}

export function jumpPlayer(
  state: GameState,
): GameState {
  if (!canJump(state.player)) {
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

  const nextScore = calculateScore(
    state.score,
    obstacleStep.passedObstacleCount,
  );

  if (
    hasAnyCollision(
      state.player,
      obstacleStep.activeObstacles,
    )
  ) {
    return {
      ...state,
      status: "game-over",
      score: nextScore,
      obstacles: obstacleStep.activeObstacles,
    };
  }

  return {
    ...state,
    score: nextScore,
    player: advancePlayer(
      state.player,
      deltaSeconds,
    ),
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
      obstacle,
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
    velocityY: 0,
    isGrounded: true,
  };
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

function canAdvanceGame(
  state: GameState,
  deltaSeconds: number,
): boolean {
  return isGameRunning(state) &&
    isValidDeltaSeconds(deltaSeconds);
}

function canJump(
  player: PlayerState,
): boolean {
  return player.isGrounded;
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
  return {
    ...obstacle,
    x: obstacle.x -
      GAME_PHYSICS.obstacleSpeed *
        deltaSeconds,
  };
}

function isObstacleOffScreen(
  obstacle: ObstacleState,
): boolean {
  return obstacle.x < 0;
}

function calculateScore(
  currentScore: number,
  passedObstacleCount: number,
): number {
  return currentScore +
    passedObstacleCount;
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

  return {
    velocityY,
    y: moveVertically(
      player.y,
      velocityY,
      deltaSeconds,
    ),
  };
}

function applyGravity(
  velocityY: number,
  deltaSeconds: number,
): number {
  return velocityY +
    GAME_PHYSICS.gravity * deltaSeconds;
}

function moveVertically(
  y: number,
  velocityY: number,
  deltaSeconds: number,
): number {
  return y +
    velocityY * deltaSeconds;
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
    velocityY: 0,
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
  const {
    x,
    width,
    height,
  } = GAME_PHYSICS.playerHitbox;

  return {
    left: x,
    right: x + width,
    top: player.y - height,
    bottom: player.y,
  };
}

function getObstacleBounds(
  obstacle: ObstacleState,
): CollisionBounds {
  return {
    left: obstacle.x,
    right: obstacle.x + obstacle.width,
    top: GAME_PHYSICS.groundY -
      obstacle.height,
    bottom: GAME_PHYSICS.groundY,
  };
}

function boundsOverlap(
  first: CollisionBounds,
  second: CollisionBounds,
): boolean {
  const overlapsHorizontally = first.right > second.left &&
    first.left < second.right;

  const overlapsVertically = first.bottom > second.top &&
    first.top < second.bottom;

  return overlapsHorizontally &&
    overlapsVertically;
}
