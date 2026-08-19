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

export function stepGame(
  state: GameState,
  deltaSeconds: number,
): GameState {
  if (
    deltaSeconds <= 0 ||
    state.status !== "running" ||
    state.player.isGrounded
  ) {
    return state;
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
    };
  }

  return {
    ...state,
    player: {
      ...state.player,
      y,
      velocityY,
    },
  };
}
