export type GameStatus =
  | "ready"
  | "running"
  | "game-over";

export type PlayerState = {
  y: number;
  velocityY: number;
  isGrounded: boolean;
};

export type ObstacleState = {
  id: string;
  x: number;
  width: number;
  height: number;
};

export type GameState = {
  status: GameStatus;
  score: number;
  player: PlayerState;
  obstacles: ObstacleState[];
};

export function createInitialGameState(): GameState {
  return {
    status: "ready",
    score: 0,

    player: {
      y: 0,
      velocityY: 0,
      isGrounded: true,
    },

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

const JUMP_VELOCITY = -1;

export function jumpPlayer(
  state: GameState,
): GameState {
  if (!state.player.isGrounded) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      velocityY: JUMP_VELOCITY,
      isGrounded: false,
    },
  };
}

const GRAVITY = 2;
const OBSTACLE_SPEED = 4;

export function stepGame(
  state: GameState,
  deltaSeconds: number,
): GameState {
  if (
    deltaSeconds <= 0 ||
    state.status !== "running"
  ) {
    return state;
  }

  const movedObstacles = state.obstacles.map(
    (obstacle) => ({
      ...obstacle,
      x: obstacle.x -
        OBSTACLE_SPEED * deltaSeconds,
    }),
  );

  const passedObstacleCount = movedObstacles
    .filter((obstacle) => obstacle.x < 0)
    .length;

  const obstacles = movedObstacles
    .filter((obstacle) => obstacle.x >= 0);

  const score = state.score + passedObstacleCount;

  const collided = obstacles.some(
    (obstacle) => hasCollision(state.player, obstacle),
  );

  if (collided) {
    return {
      ...state,
      status: "game-over",
      score,
      obstacles,
    };
  }

  const velocityY = state.player.velocityY +
    GRAVITY * deltaSeconds;

  const y = state.player.y +
    velocityY * deltaSeconds;

  if (y >= 0) {
    return {
      ...state,
      player: {
        ...state.player,
        y: 0,
        velocityY: 0,
        isGrounded: true,
      },
      score,
      obstacles,
    };
  }

  return {
    ...state,
    player: {
      ...state.player,
      y,
      velocityY,
    },
    score,
    obstacles,
  };
}

export function spawnObstacle(
  state: GameState,
  obstacle: ObstacleState,
): GameState {
  if (state.status !== "running") {
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

const PLAYER_X = 1;
const PLAYER_WIDTH = 1;
const PLAYER_HEIGHT = 1;

export function hasCollision(
  player: PlayerState,
  obstacle: ObstacleState,
): boolean {
  const playerLeft = PLAYER_X;
  const playerRight = PLAYER_X + PLAYER_WIDTH;

  const obstacleLeft = obstacle.x;
  const obstacleRight = obstacle.x + obstacle.width;

  const playerTop = player.y - PLAYER_HEIGHT;

  const playerBottom = player.y;

  const obstacleTop = -obstacle.height;
  const obstacleBottom = 0;

  const overlapsHorizontally = playerRight > obstacleLeft &&
    playerLeft < obstacleRight;

  const overlapsVertically = playerBottom > obstacleTop &&
    playerTop < obstacleBottom;

  return (
    overlapsHorizontally &&
    overlapsVertically
  );
}
