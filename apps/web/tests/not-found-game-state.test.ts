import {
  createInitialGameState,
  type GameState,
  hasCollision,
  jumpPlayer,
  type ObstacleState,
  restartGame,
  spawnObstacle,
  startGame,
  stepGame,
} from "../src/features/not-found-game/game-state.ts";

/* -------------------------------------------------------------------------- */
/* Test values                                                                */
/* -------------------------------------------------------------------------- */

const FLOAT_TOLERANCE = 1e-10;

const EXPECTED_INITIAL_SCORE = 0;
const EXPECTED_INITIAL_PLAYER_Y = 0;
const EXPECTED_INITIAL_PLAYER_VELOCITY_Y = 0;

const EXPECTED_JUMP_VELOCITY_Y = -1;

const QUARTER_SECOND = 0.25;
const HALF_SECOND = 0.5;
const SHORT_COLLISION_FRAME_SECONDS = 0.01;
const ADVANCED_COLLISION_FRAME_SECONDS = 0.1;

const NEGATIVE_QUARTER_SECOND = -QUARTER_SECOND;

const DEFAULT_OBSTACLE_X = 10;
const DEFAULT_OBSTACLE_WIDTH = 1;
const DEFAULT_OBSTACLE_HEIGHT = 1;

const NO_OBSTACLES = 0;
const ONE_OBSTACLE = 1;
const TWO_OBSTACLES = 2;

const EXPECTED_OBSTACLE_X_AFTER_HALF_SECOND = 8;

const PASSED_OBSTACLE_START_X = 1;
const VISIBLE_OBSTACLE_START_X = 5;
const EXPECTED_VISIBLE_OBSTACLE_X = 3;

const PARTIALLY_VISIBLE_OBSTACLE_START_X = 1.75;
const EXPECTED_PARTIALLY_VISIBLE_X = -0.25;

const COLLISION_OBSTACLE_X = 1;
const COLLISION_OBSTACLE_START_X = 1.04;

const AIRBORNE_CLEARANCE_PLAYER_Y = -2;

const LANDING_PLAYER_START_Y = -0.1;
const LANDING_PLAYER_START_VELOCITY_Y = 1;

const EXPECTED_PLAYER_VELOCITY_AFTER_QUARTER_SECOND = -0.5;
const EXPECTED_PLAYER_Y_AFTER_QUARTER_SECOND = -0.125;

const FALLING_COLLISION_PLAYER_START_Y = -1.05;
const FALLING_COLLISION_PLAYER_START_VELOCITY_Y = 0.8;
const FALLING_COLLISION_OBSTACLE_START_X = 1.4;
const EXPECTED_FALLING_COLLISION_PLAYER_Y = -0.95;

const COLLISION_FRAME_PASSED_OBSTACLE_START_X = 0.5;
const COLLISION_FRAME_COLLIDING_OBSTACLE_START_X = 3;

const EXPECTED_SCORE_AFTER_ONE_PASSED_OBSTACLE = 1;
const EXISTING_GAME_OVER_SCORE = 5;

const RESTART_TEST_SCORE = 7;
const RESTART_TEST_PLAYER_Y = -0.5;
const RESTART_TEST_PLAYER_VELOCITY_Y = 1;
const RESTART_TEST_OBSTACLE_X = 4;

const EXPECTED_HIGH_SCORE_AFTER_RUN = 7;
/* -------------------------------------------------------------------------- */
/* Test helpers                                                               */
/* -------------------------------------------------------------------------- */

type GameStateOverrides = Partial<Omit<GameState, "status">>;

function createObstacle(
  overrides: Partial<ObstacleState> = {},
): ObstacleState {
  return {
    id: "obstacle",
    x: DEFAULT_OBSTACLE_X,
    width: DEFAULT_OBSTACLE_WIDTH,
    height: DEFAULT_OBSTACLE_HEIGHT,
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

function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEquals<T>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (!Object.is(actual, expected)) {
    throw new Error(
      `${message} Expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

function assertApproximatelyEquals(
  actual: number,
  expected: number,
  message: string,
): void {
  const difference = Math.abs(
    actual - expected,
  );

  if (difference > FLOAT_TOLERANCE) {
    throw new Error(
      `${message} Expected approximately ${String(expected)}, received ${
        String(actual)
      }.`,
    );
  }
}

function assertSameReference<T extends object>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(message);
  }
}

function assertDifferentReference<
  T extends object,
>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual === expected) {
    throw new Error(message);
  }
}

function getOnlyObstacle(
  state: GameState,
): ObstacleState {
  assertEquals(
    state.obstacles.length,
    ONE_OBSTACLE,
    "Expected exactly one obstacle.",
  );

  const obstacle = state.obstacles[0];

  assert(
    obstacle !== undefined,
    "Expected obstacle to exist.",
  );

  return obstacle;
}

/* -------------------------------------------------------------------------- */
/* createInitialGameState                                                     */
/* -------------------------------------------------------------------------- */

Deno.test(
  "createInitialGameState: creates a deterministic ready state",
  () => {
    const state = createInitialGameState();

    assertEquals(
      state.status,
      "ready",
      "Initial game status is incorrect.",
    );

    assertEquals(
      state.score,
      EXPECTED_INITIAL_SCORE,
      "Initial score is incorrect.",
    );

    assertEquals(
      state.player.y,
      EXPECTED_INITIAL_PLAYER_Y,
      "Initial player y position is incorrect.",
    );

    assertEquals(
      state.player.velocityY,
      EXPECTED_INITIAL_PLAYER_VELOCITY_Y,
      "Initial player velocity is incorrect.",
    );

    assert(
      state.player.isGrounded,
      "Player should initially be grounded.",
    );

    assertEquals(
      state.obstacles.length,
      NO_OBSTACLES,
      "Initial state should contain no obstacles.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* startGame                                                                  */
/* -------------------------------------------------------------------------- */

Deno.test(
  "startGame: transitions ready state to running",
  () => {
    const state = createInitialGameState();

    const nextState = startGame(state);

    assertEquals(
      nextState.status,
      "running",
      "Starting the game should transition to running.",
    );

    assertEquals(
      state.status,
      "ready",
      "startGame() must not mutate the original state.",
    );

    assertDifferentReference(
      nextState,
      state,
      "A successful start must return a new state.",
    );
  },
);

Deno.test(
  "startGame: running game ignores another start request",
  () => {
    const state = createRunningState();

    const nextState = startGame(state);

    assertSameReference(
      nextState,
      state,
      "A running game should ignore another start request.",
    );
  },
);

Deno.test(
  "startGame: game-over state cannot be started directly",
  () => {
    const state = createGameOverState({
      score: EXISTING_GAME_OVER_SCORE,
    });

    const nextState = startGame(state);

    assertSameReference(
      nextState,
      state,
      "Game-over state should require an explicit restart.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* jumpPlayer                                                                 */
/* -------------------------------------------------------------------------- */

Deno.test(
  "jumpPlayer: ready player cannot jump",
  () => {
    const state = createInitialGameState();

    const nextState = jumpPlayer(state);

    assertSameReference(
      nextState,
      state,
      "Player should not jump before the game starts.",
    );
  },
);

Deno.test(
  "jumpPlayer: game-over player cannot jump",
  () => {
    const state = createGameOverState();

    const nextState = jumpPlayer(state);

    assertSameReference(
      nextState,
      state,
      "Player should not jump after game-over.",
    );
  },
);

Deno.test(
  "jumpPlayer: grounded running player can jump",
  () => {
    const state = createRunningState();

    const nextState = jumpPlayer(state);

    assertEquals(
      nextState.player.velocityY,
      EXPECTED_JUMP_VELOCITY_Y,
      "Jumping should apply the expected upward velocity.",
    );

    assert(
      !nextState.player.isGrounded,
      "Jumping should make the player airborne.",
    );

    assert(
      state.player.isGrounded,
      "jumpPlayer() must not mutate the original player.",
    );

    assertDifferentReference(
      nextState,
      state,
      "A successful jump must return a new game state.",
    );

    assertDifferentReference(
      nextState.player,
      state.player,
      "A successful jump must return a new player state.",
    );
  },
);

Deno.test(
  "jumpPlayer: airborne player cannot jump again",
  () => {
    const state = jumpPlayer(
      createRunningState(),
    );

    const nextState = jumpPlayer(state);

    assertEquals(
      nextState.player.velocityY,
      state.player.velocityY,
      "Airborne jump should preserve vertical velocity.",
    );

    assert(
      !nextState.player.isGrounded,
      "Airborne player should remain airborne.",
    );

    assertSameReference(
      nextState,
      state,
      "Ignored airborne jump should return the existing state.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* spawnObstacle                                                              */
/* -------------------------------------------------------------------------- */

Deno.test(
  "spawnObstacle: running game can spawn an obstacle",
  () => {
    const state = createRunningState();

    const obstacle = createObstacle({
      id: "spawned",
    });

    const nextState = spawnObstacle(
      state,
      obstacle,
    );

    assertEquals(
      nextState.obstacles.length,
      ONE_OBSTACLE,
      "Running game should contain the spawned obstacle.",
    );

    const spawnedObstacle = getOnlyObstacle(nextState);

    assertEquals(
      spawnedObstacle.id,
      "spawned",
      "Spawned obstacle id is incorrect.",
    );

    assertEquals(
      spawnedObstacle.x,
      DEFAULT_OBSTACLE_X,
      "Spawned obstacle position is incorrect.",
    );

    assertEquals(
      state.obstacles.length,
      NO_OBSTACLES,
      "spawnObstacle() must not mutate the original state.",
    );

    assertDifferentReference(
      nextState.obstacles,
      state.obstacles,
      "Spawning should return a new obstacles array.",
    );

    assertDifferentReference(
      spawnedObstacle,
      obstacle,
      "Game state should snapshot the spawned obstacle.",
    );
  },
);

Deno.test(
  "spawnObstacle: non-running games ignore obstacle spawning",
  () => {
    const cases = [
      {
        name: "ready",
        state: createInitialGameState(),
      },
      {
        name: "game-over",
        state: createGameOverState(),
      },
    ] as const;

    for (const testCase of cases) {
      const nextState = spawnObstacle(
        testCase.state,
        createObstacle(),
      );

      assertSameReference(
        nextState,
        testCase.state,
        `${testCase.name} game should ignore obstacle spawning.`,
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* hasCollision                                                               */
/* -------------------------------------------------------------------------- */

Deno.test(
  "hasCollision: grounded player collides with overlapping obstacle",
  () => {
    const player = createInitialGameState().player;

    const obstacle = createObstacle({
      x: COLLISION_OBSTACLE_X,
    });

    assert(
      hasCollision(player, obstacle),
      "Expected overlapping player and obstacle to collide.",
    );
  },
);

Deno.test(
  "hasCollision: airborne player can clear an obstacle",
  () => {
    const player = {
      ...createInitialGameState().player,
      y: AIRBORNE_CLEARANCE_PLAYER_Y,
      isGrounded: false,
    };

    const obstacle = createObstacle({
      x: COLLISION_OBSTACLE_X,
    });

    assert(
      !hasCollision(player, obstacle),
      "Player above the obstacle should not collide.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* stepGame - validation                                                      */
/* -------------------------------------------------------------------------- */

Deno.test(
  "stepGame: non-running games do not advance",
  () => {
    const cases = [
      {
        name: "ready",
        state: createInitialGameState(),
      },
      {
        name: "game-over",
        state: createGameOverState(),
      },
    ] as const;

    for (const testCase of cases) {
      const nextState = stepGame(
        testCase.state,
        QUARTER_SECOND,
      );

      assertSameReference(
        nextState,
        testCase.state,
        `${testCase.name} game should not advance.`,
      );
    }
  },
);

Deno.test(
  "stepGame: invalid delta does not advance the game",
  () => {
    const state = createRunningState();

    const invalidDeltas = [
      0,
      NEGATIVE_QUARTER_SECOND,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];

    for (
      const deltaSeconds of invalidDeltas
    ) {
      const nextState = stepGame(
        state,
        deltaSeconds,
      );

      assertSameReference(
        nextState,
        state,
        `Delta ${deltaSeconds} should not advance the game.`,
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/* stepGame - player physics                                                  */
/* -------------------------------------------------------------------------- */

Deno.test(
  "stepGame: gravity increases airborne vertical velocity",
  () => {
    const state = jumpPlayer(
      createRunningState(),
    );

    const nextState = stepGame(
      state,
      QUARTER_SECOND,
    );

    assert(
      nextState.player.velocityY >
        state.player.velocityY,
      "Gravity should increase vertical velocity.",
    );

    assertEquals(
      state.player.velocityY,
      EXPECTED_JUMP_VELOCITY_Y,
      "stepGame() must not mutate the original player.",
    );

    assertDifferentReference(
      nextState,
      state,
      "Physics advancement should return a new state.",
    );

    assertDifferentReference(
      nextState.player,
      state.player,
      "Player physics should return a new player state.",
    );
  },
);

Deno.test(
  "stepGame: airborne player moves using updated vertical velocity",
  () => {
    const state = jumpPlayer(
      createRunningState(),
    );

    const nextState = stepGame(
      state,
      QUARTER_SECOND,
    );

    assertApproximatelyEquals(
      nextState.player.velocityY,
      EXPECTED_PLAYER_VELOCITY_AFTER_QUARTER_SECOND,
      "Vertical velocity is incorrect.",
    );

    assertApproximatelyEquals(
      nextState.player.y,
      EXPECTED_PLAYER_Y_AFTER_QUARTER_SECOND,
      "Vertical position is incorrect.",
    );

    assertEquals(
      state.player.y,
      EXPECTED_INITIAL_PLAYER_Y,
      "stepGame() must not mutate the original player position.",
    );
  },
);

Deno.test(
  "stepGame: player lands at ground level",
  () => {
    const state = createRunningState({
      player: {
        y: LANDING_PLAYER_START_Y,
        velocityY: LANDING_PLAYER_START_VELOCITY_Y,
        isGrounded: false,
      },
    });

    const nextState = stepGame(
      state,
      QUARTER_SECOND,
    );

    assertEquals(
      nextState.player.y,
      EXPECTED_INITIAL_PLAYER_Y,
      "Landing should clamp player to ground level.",
    );

    assertEquals(
      nextState.player.velocityY,
      EXPECTED_INITIAL_PLAYER_VELOCITY_Y,
      "Landing should reset vertical velocity.",
    );

    assert(
      nextState.player.isGrounded,
      "Landing should mark player as grounded.",
    );

    assertEquals(
      state.player.y,
      LANDING_PLAYER_START_Y,
      "Landing must not mutate the original player.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* stepGame - obstacle physics                                                */
/* -------------------------------------------------------------------------- */

Deno.test(
  "stepGame: running game moves obstacles left",
  () => {
    const state = createRunningState({
      obstacles: [
        createObstacle({
          id: "moving",
        }),
      ],
    });

    const nextState = stepGame(
      state,
      HALF_SECOND,
    );

    const movedObstacle = getOnlyObstacle(nextState);

    assertApproximatelyEquals(
      movedObstacle.x,
      EXPECTED_OBSTACLE_X_AFTER_HALF_SECOND,
      "Obstacle should move left according to obstacle speed.",
    );

    assertEquals(
      state.obstacles[0]?.x,
      DEFAULT_OBSTACLE_X,
      "stepGame() must not mutate the original obstacle.",
    );

    assertDifferentReference(
      nextState.obstacles,
      state.obstacles,
      "Obstacle movement should return a new array.",
    );

    const originalObstacle = state.obstacles[0];

    assert(
      originalObstacle !== undefined,
      "Expected original obstacle to exist.",
    );

    assertDifferentReference(
      movedObstacle,
      originalObstacle,
      "Obstacle movement should return a new obstacle.",
    );
  },
);

Deno.test(
  "stepGame: removes obstacles after their trailing edge passes off-screen",
  () => {
    const state = createRunningState({
      obstacles: [
        createObstacle({
          id: "passed",
          x: PASSED_OBSTACLE_START_X,
        }),
        createObstacle({
          id: "visible",
          x: VISIBLE_OBSTACLE_START_X,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      HALF_SECOND,
    );

    assertEquals(
      nextState.obstacles.length,
      ONE_OBSTACLE,
      "Exactly one obstacle should remain.",
    );

    const remainingObstacle = getOnlyObstacle(nextState);

    assertEquals(
      remainingObstacle.id,
      "visible",
      "Visible obstacle should remain active.",
    );

    assertApproximatelyEquals(
      remainingObstacle.x,
      EXPECTED_VISIBLE_OBSTACLE_X,
      "Visible obstacle position is incorrect.",
    );

    assertEquals(
      state.obstacles.length,
      TWO_OBSTACLES,
      "stepGame() must not mutate the original obstacle collection.",
    );
  },
);

Deno.test(
  "stepGame: partially visible obstacle remains active",
  () => {
    const state = createRunningState({
      obstacles: [
        createObstacle({
          id: "partially-visible",
          x: PARTIALLY_VISIBLE_OBSTACLE_START_X,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      HALF_SECOND,
    );

    const obstacle = getOnlyObstacle(nextState);

    assertApproximatelyEquals(
      obstacle.x,
      EXPECTED_PARTIALLY_VISIBLE_X,
      "Obstacle should retain its advanced x position.",
    );

    assertEquals(
      nextState.score,
      EXPECTED_INITIAL_SCORE,
      "Partially visible obstacle must not score yet.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* stepGame - scoring                                                         */
/* -------------------------------------------------------------------------- */

Deno.test(
  "stepGame: score increases when an obstacle is fully passed",
  () => {
    const state = createRunningState({
      score: EXPECTED_INITIAL_SCORE,
      obstacles: [
        createObstacle({
          id: "passed",
          x: PASSED_OBSTACLE_START_X,
        }),
        createObstacle({
          id: "visible",
          x: VISIBLE_OBSTACLE_START_X,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      HALF_SECOND,
    );

    assertEquals(
      nextState.score,
      EXPECTED_SCORE_AFTER_ONE_PASSED_OBSTACLE,
      "Passing one obstacle should award one point.",
    );

    assertEquals(
      state.score,
      EXPECTED_INITIAL_SCORE,
      "stepGame() must not mutate the original score.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* stepGame - collision                                                       */
/* -------------------------------------------------------------------------- */

Deno.test(
  "stepGame: collision transitions running game to game-over",
  () => {
    const state = createRunningState({
      obstacles: [
        createObstacle({
          id: "collision",
          x: COLLISION_OBSTACLE_START_X,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      SHORT_COLLISION_FRAME_SECONDS,
    );

    assertEquals(
      nextState.status,
      "game-over",
      "Collision should end the running game.",
    );

    assertEquals(
      state.status,
      "running",
      "Collision must not mutate the original state.",
    );
  },
);

Deno.test(
  "stepGame: collision uses the player's advanced position",
  () => {
    const state = createRunningState({
      player: {
        y: FALLING_COLLISION_PLAYER_START_Y,
        velocityY: FALLING_COLLISION_PLAYER_START_VELOCITY_Y,
        isGrounded: false,
      },
      obstacles: [
        createObstacle({
          id: "falling-collision",
          x: FALLING_COLLISION_OBSTACLE_START_X,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      ADVANCED_COLLISION_FRAME_SECONDS,
    );

    assertEquals(
      nextState.status,
      "game-over",
      "Player entering obstacle bounds during the frame should collide.",
    );

    assertApproximatelyEquals(
      nextState.player.y,
      EXPECTED_FALLING_COLLISION_PLAYER_Y,
      "Game-over state should preserve the collision-frame player position.",
    );
  },
);

Deno.test(
  "stepGame: collision frame does not award passed-obstacle score",
  () => {
    const state = createRunningState({
      score: EXPECTED_INITIAL_SCORE,
      obstacles: [
        createObstacle({
          id: "passed",
          x: COLLISION_FRAME_PASSED_OBSTACLE_START_X,
        }),
        createObstacle({
          id: "collision",
          x: COLLISION_FRAME_COLLIDING_OBSTACLE_START_X,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      HALF_SECOND,
    );

    assertEquals(
      nextState.status,
      "game-over",
      "Collision should end the game.",
    );

    assertEquals(
      nextState.score,
      EXPECTED_INITIAL_SCORE,
      "Collision frame should preserve the existing score.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* restartGame                                                                */
/* -------------------------------------------------------------------------- */

Deno.test(
  "restartGame: game-over state resets to a fresh ready state",
  () => {
    const state = createGameOverState({
      score: RESTART_TEST_SCORE,
      player: {
        y: RESTART_TEST_PLAYER_Y,
        velocityY: RESTART_TEST_PLAYER_VELOCITY_Y,
        isGrounded: false,
      },
      obstacles: [
        createObstacle({
          id: "restart-obstacle",
          x: RESTART_TEST_OBSTACLE_X,
        }),
      ],
    });

    const nextState = restartGame(state);

    assertEquals(
      nextState.status,
      "ready",
      "Restarted game should return to ready.",
    );

    assertEquals(
      nextState.score,
      EXPECTED_INITIAL_SCORE,
      "Restarted game should reset score.",
    );

    assertEquals(
      nextState.player.y,
      EXPECTED_INITIAL_PLAYER_Y,
      "Restarted game should reset player position.",
    );

    assertEquals(
      nextState.player.velocityY,
      EXPECTED_INITIAL_PLAYER_VELOCITY_Y,
      "Restarted game should reset player velocity.",
    );

    assert(
      nextState.player.isGrounded,
      "Restarted game should reset player to grounded.",
    );

    assertEquals(
      nextState.obstacles.length,
      NO_OBSTACLES,
      "Restarted game should remove all obstacles.",
    );

    assertEquals(
      state.status,
      "game-over",
      "restartGame() must not mutate the original status.",
    );

    assertEquals(
      state.score,
      RESTART_TEST_SCORE,
      "restartGame() must not mutate the original score.",
    );

    assertEquals(
      state.obstacles.length,
      ONE_OBSTACLE,
      "restartGame() must not mutate the original obstacles.",
    );

    assertDifferentReference(
      nextState,
      state,
      "Restarting should return a new game state.",
    );

    assertDifferentReference(
      nextState.player,
      state.player,
      "Restarting should return a fresh player state.",
    );

    assertDifferentReference(
      nextState.obstacles,
      state.obstacles,
      "Restarting should return a fresh obstacles array.",
    );
  },
);

Deno.test(
  "restartGame: preserves the in-session high score",
  () => {
    const state: GameState = {
      ...createGameOverState({
        score: EXPECTED_HIGH_SCORE_AFTER_RUN,
      }),
      highScore: EXPECTED_HIGH_SCORE_AFTER_RUN,
    };

    const nextState = restartGame(state);

    assertEquals(
      nextState.status,
      "ready",
      "Restarted game should return to ready.",
    );

    assertEquals(
      nextState.score,
      EXPECTED_INITIAL_SCORE,
      "Restarted game should reset the current score.",
    );

    assertEquals(
      nextState.highScore,
      EXPECTED_HIGH_SCORE_AFTER_RUN,
      "Restarted game should preserve the in-session high score.",
    );
  },
);
