import {
  createInitialGameState,
  type GameState,
  hasCollision,
  jumpPlayer,
  restartGame,
  spawnObstacle,
  startGame,
  stepGame,
} from "../src/features/not-found-game/game-state.ts";

import { gameFixture as fx } from "./fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "./helpers/assertions.ts";

function getOnlyObstacle(
  state: GameState,
) {
  expect.equals(
    state.obstacles.length,
    fx.values.counts.one,
    "Expected exactly one obstacle.",
  );

  const obstacle = state.obstacles[0];

  expect.assert(
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

    expect.equals(
      state.status,
      "ready",
      "Initial game status is incorrect.",
    );

    expect.equals(
      state.score,
      fx.values.initial.score,
      "Initial score is incorrect.",
    );

    expect.equals(
      state.highScore,
      fx.values.initial.highScore,
      "Initial high score is incorrect.",
    );

    expect.equals(
      state.player.y,
      fx.values.initial.playerY,
      "Initial player y position is incorrect.",
    );

    expect.equals(
      state.player.velocityY,
      fx.values.initial.playerVelocityY,
      "Initial player velocity is incorrect.",
    );

    expect.assert(
      state.player.isGrounded,
      "Player should initially be grounded.",
    );

    expect.equals(
      state.obstacles.length,
      fx.values.counts.none,
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

    expect.equals(
      nextState.status,
      "running",
      "Starting the game should transition to running.",
    );

    expect.equals(
      state.status,
      "ready",
      "startGame() must not mutate the original state.",
    );

    expect.differentReference(
      nextState,
      state,
      "A successful start must return a new state.",
    );
  },
);

Deno.test(
  "startGame: running game ignores another start request",
  () => {
    const state = fx.createRunningState();

    const nextState = startGame(state);

    expect.sameReference(
      nextState,
      state,
      "A running game should ignore another start request.",
    );
  },
);

Deno.test(
  "startGame: game-over state cannot be started directly",
  () => {
    const state = fx.createGameOverState({
      score: fx.values.score.restartTestScore,
    });

    const nextState = startGame(state);

    expect.sameReference(
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

    expect.sameReference(
      nextState,
      state,
      "Player should not jump before the game starts.",
    );
  },
);

Deno.test(
  "jumpPlayer: game-over player cannot jump",
  () => {
    const state = fx.createGameOverState();

    const nextState = jumpPlayer(state);

    expect.sameReference(
      nextState,
      state,
      "Player should not jump after game-over.",
    );
  },
);

Deno.test(
  "jumpPlayer: grounded running player can jump",
  () => {
    const state = fx.createRunningState();

    const nextState = jumpPlayer(state);

    expect.equals(
      nextState.player.velocityY,
      fx.values.player.jumpVelocityY,
      "Jumping should apply the expected upward velocity.",
    );

    expect.assert(
      !nextState.player.isGrounded,
      "Jumping should make the player airborne.",
    );

    expect.assert(
      state.player.isGrounded,
      "jumpPlayer() must not mutate the original player.",
    );

    expect.differentReference(
      nextState,
      state,
      "A successful jump must return a new game state.",
    );

    expect.differentReference(
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
      fx.createRunningState(),
    );

    const nextState = jumpPlayer(state);

    expect.equals(
      nextState.player.velocityY,
      state.player.velocityY,
      "Airborne jump should preserve vertical velocity.",
    );

    expect.assert(
      !nextState.player.isGrounded,
      "Airborne player should remain airborne.",
    );

    expect.sameReference(
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
    const state = fx.createRunningState();

    const obstacle = fx.createObstacle({
      id: "spawned",
    });

    const nextState = spawnObstacle(
      state,
      obstacle,
    );

    expect.equals(
      nextState.obstacles.length,
      fx.values.counts.one,
      "Running game should contain the spawned obstacle.",
    );

    const spawnedObstacle = getOnlyObstacle(nextState);

    expect.equals(
      spawnedObstacle.id,
      "spawned",
      "Spawned obstacle id is incorrect.",
    );

    expect.equals(
      spawnedObstacle.x,
      fx.values.obstacle.defaultX,
      "Spawned obstacle position is incorrect.",
    );

    expect.equals(
      state.obstacles.length,
      fx.values.counts.none,
      "spawnObstacle() must not mutate the original state.",
    );

    expect.differentReference(
      nextState.obstacles,
      state.obstacles,
      "Spawning should return a new obstacles array.",
    );

    expect.differentReference(
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
        state: fx.createGameOverState(),
      },
    ] as const;

    for (const testCase of cases) {
      const nextState = spawnObstacle(
        testCase.state,
        fx.createObstacle(),
      );

      expect.sameReference(
        nextState,
        testCase.state,
        `${testCase.name} game should ignore obstacle spawning.`,
      );
    }
  },
);

Deno.test(
  "spawnObstacle: running game ignores an obstacle with an existing id",
  () => {
    const existingObstacle = fx.createObstacle({
      id: "existing-obstacle",
    });

    const state = fx.createRunningState({
      obstacles: [
        existingObstacle,
      ],
    });

    const duplicateObstacle = fx.createObstacle({
      id: existingObstacle.id,
      x: fx.values.obstacle.visibleStartX,
    });

    const nextState = spawnObstacle(
      state,
      duplicateObstacle,
    );

    expect.sameReference(
      nextState,
      state,
      "Duplicate obstacle id should be ignored.",
    );

    expect.equals(
      nextState.obstacles.length,
      fx.values.counts.one,
      "Duplicate obstacle should not be added.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* hasCollision                                                               */
/* -------------------------------------------------------------------------- */

Deno.test(
  "hasCollision: grounded player collides with overlapping obstacle",
  () => {
    const player = createInitialGameState().player;

    const obstacle = fx.createObstacle({
      x: fx.values.obstacle.collisionX,
    });

    expect.assert(
      hasCollision(player, obstacle),
      "Expected overlapping player and obstacle to collide.",
    );
  },
);

Deno.test(
  "hasCollision: airborne player can clear an obstacle",
  () => {
    const player = fx.createPlayer({
      y: fx.values.player.airborneClearanceY,
      isGrounded: false,
    });

    const obstacle = fx.createObstacle({
      x: fx.values.obstacle.collisionX,
    });

    expect.assert(
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
        state: fx.createGameOverState(),
      },
    ] as const;

    for (const testCase of cases) {
      const nextState = stepGame(
        testCase.state,
        fx.values.time.quarterSecond,
      );

      expect.sameReference(
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
    const state = fx.createRunningState();

    const invalidDeltas = [
      0,
      fx.values.time.negativeQuarterSecond,
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

      expect.sameReference(
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
      fx.createRunningState(),
    );

    const nextState = stepGame(
      state,
      fx.values.time.quarterSecond,
    );

    expect.assert(
      nextState.player.velocityY >
        state.player.velocityY,
      "Gravity should increase vertical velocity.",
    );

    expect.equals(
      state.player.velocityY,
      fx.values.player.jumpVelocityY,
      "stepGame() must not mutate the original player.",
    );

    expect.differentReference(
      nextState,
      state,
      "Physics advancement should return a new state.",
    );

    expect.differentReference(
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
      fx.createRunningState(),
    );

    const nextState = stepGame(
      state,
      fx.values.time.quarterSecond,
    );

    expect.approximatelyEquals(
      nextState.player.velocityY,
      fx.values.player.velocityAfterQuarterSecond,
      "Vertical velocity is incorrect.",
    );

    expect.approximatelyEquals(
      nextState.player.y,
      fx.values.player.yAfterQuarterSecond,
      "Vertical position is incorrect.",
    );

    expect.equals(
      state.player.y,
      fx.values.initial.playerY,
      "stepGame() must not mutate the original player position.",
    );
  },
);

Deno.test(
  "stepGame: player lands at ground level",
  () => {
    const state = fx.createRunningState({
      player: fx.createPlayer({
        y: fx.values.player.landingStartY,
        velocityY: fx.values.player.landingStartVelocityY,
        isGrounded: false,
      }),
    });

    const nextState = stepGame(
      state,
      fx.values.time.quarterSecond,
    );

    expect.equals(
      nextState.player.y,
      fx.values.initial.playerY,
      "Landing should clamp player to ground level.",
    );

    expect.equals(
      nextState.player.velocityY,
      fx.values.initial.playerVelocityY,
      "Landing should reset vertical velocity.",
    );

    expect.assert(
      nextState.player.isGrounded,
      "Landing should mark player as grounded.",
    );

    expect.equals(
      state.player.y,
      fx.values.player.landingStartY,
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
    const state = fx.createRunningState({
      obstacles: [
        fx.createObstacle({
          id: "moving",
        }),
      ],
    });

    const nextState = stepGame(
      state,
      fx.values.time.halfSecond,
    );

    const movedObstacle = getOnlyObstacle(nextState);

    expect.approximatelyEquals(
      movedObstacle.x,
      fx.values.obstacle.xAfterHalfSecond,
      "Obstacle should move left according to obstacle speed.",
    );

    expect.equals(
      state.obstacles[0]?.x,
      fx.values.obstacle.defaultX,
      "stepGame() must not mutate the original obstacle.",
    );

    expect.differentReference(
      nextState.obstacles,
      state.obstacles,
      "Obstacle movement should return a new array.",
    );

    const originalObstacle = state.obstacles[0];

    expect.assert(
      originalObstacle !== undefined,
      "Expected original obstacle to exist.",
    );

    expect.differentReference(
      movedObstacle,
      originalObstacle,
      "Obstacle movement should return a new obstacle.",
    );
  },
);

Deno.test(
  "stepGame: removes obstacles after their trailing edge passes off-screen",
  () => {
    const state = fx.createRunningState({
      obstacles: [
        fx.createObstacle({
          id: "passed",
          x: fx.values.obstacle.passedStartX,
        }),
        fx.createObstacle({
          id: "visible",
          x: fx.values.obstacle.visibleStartX,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      fx.values.time.halfSecond,
    );

    expect.equals(
      nextState.obstacles.length,
      fx.values.counts.one,
      "Exactly one obstacle should remain.",
    );

    const remainingObstacle = getOnlyObstacle(nextState);

    expect.equals(
      remainingObstacle.id,
      "visible",
      "Visible obstacle should remain active.",
    );

    expect.approximatelyEquals(
      remainingObstacle.x,
      fx.values.obstacle.visibleExpectedX,
      "Visible obstacle position is incorrect.",
    );

    expect.equals(
      state.obstacles.length,
      fx.values.counts.two,
      "stepGame() must not mutate the original obstacle collection.",
    );
  },
);

Deno.test(
  "stepGame: partially visible obstacle remains active",
  () => {
    const state = fx.createRunningState({
      obstacles: [
        fx.createObstacle({
          id: "partially-visible",
          x: fx.values.obstacle.partiallyVisibleStartX,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      fx.values.time.halfSecond,
    );

    const obstacle = getOnlyObstacle(nextState);

    expect.approximatelyEquals(
      obstacle.x,
      fx.values.obstacle.partiallyVisibleExpectedX,
      "Obstacle should retain its advanced x position.",
    );

    expect.equals(
      nextState.score,
      fx.values.initial.score,
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
    const state = fx.createRunningState({
      score: fx.values.initial.score,
      obstacles: [
        fx.createObstacle({
          id: "passed",
          x: fx.values.obstacle.passedStartX,
        }),
        fx.createObstacle({
          id: "visible",
          x: fx.values.obstacle.visibleStartX,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      fx.values.time.halfSecond,
    );

    expect.equals(
      nextState.score,
      fx.values.score.afterOnePassedObstacle,
      "Passing one obstacle should award one point.",
    );

    expect.equals(
      state.score,
      fx.values.initial.score,
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
    const state = fx.createRunningState({
      obstacles: [
        fx.createObstacle({
          id: "collision",
          x: fx.values.obstacle.collisionStartX,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      fx.values.time.shortCollisionFrame,
    );

    expect.equals(
      nextState.status,
      "game-over",
      "Collision should end the running game.",
    );

    expect.equals(
      state.status,
      "running",
      "Collision must not mutate the original state.",
    );
  },
);

Deno.test(
  "stepGame: collision uses the player's advanced position",
  () => {
    const state = fx.createRunningState({
      player: fx.createPlayer({
        y: fx.values.player.fallingCollisionStartY,
        velocityY: fx.values.player.fallingCollisionStartVelocityY,
        isGrounded: false,
      }),
      obstacles: [
        fx.createObstacle({
          id: "falling-collision",
          x: fx.values.obstacle.fallingCollisionStartX,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      fx.values.time.advancedCollisionFrame,
    );

    expect.equals(
      nextState.status,
      "game-over",
      "Player entering obstacle bounds during the frame should collide.",
    );

    expect.approximatelyEquals(
      nextState.player.y,
      fx.values.player.fallingCollisionExpectedY,
      "Game-over state should preserve the collision-frame player position.",
    );
  },
);

Deno.test(
  "stepGame: collision frame does not award passed-obstacle score",
  () => {
    const state = fx.createRunningState({
      score: fx.values.initial.score,
      obstacles: [
        fx.createObstacle({
          id: "passed",
          x: fx.values.obstacle.collisionFramePassedStartX,
        }),
        fx.createObstacle({
          id: "collision",
          x: fx.values.obstacle.collisionFrameCollidingStartX,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      fx.values.time.halfSecond,
    );

    expect.equals(
      nextState.status,
      "game-over",
      "Collision should end the game.",
    );

    expect.equals(
      nextState.score,
      fx.values.initial.score,
      "Collision frame should preserve the existing score.",
    );
  },
);

Deno.test(
  "stepGame: collision updates high score when current score is greater",
  () => {
    const state = fx.createRunningState({
      score: fx.values.score.newHighScore,
      highScore: fx.values.score.previousHighScore,
      obstacles: [
        fx.createObstacle({
          id: "high-score-collision",
          x: fx.values.obstacle.collisionStartX,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      fx.values.time.shortCollisionFrame,
    );

    expect.equals(
      nextState.status,
      "game-over",
      "Collision should end the game.",
    );

    expect.equals(
      nextState.score,
      fx.values.score.newHighScore,
      "Collision should preserve the completed run score.",
    );

    expect.equals(
      nextState.highScore,
      fx.values.score.newHighScore,
      "A completed run above the previous high score should become the new high score.",
    );

    expect.equals(
      state.highScore,
      fx.values.score.previousHighScore,
      "stepGame() must not mutate the original high score.",
    );
  },
);

Deno.test(
  "stepGame: collision preserves high score when current score is lower",
  () => {
    const state = fx.createRunningState({
      score: fx.values.score.lowerCompletedRunScore,
      highScore: fx.values.score.existingHighScore,
      obstacles: [
        fx.createObstacle({
          id: "lower-score-collision",
          x: fx.values.obstacle.collisionStartX,
        }),
      ],
    });

    const nextState = stepGame(
      state,
      fx.values.time.shortCollisionFrame,
    );

    expect.equals(
      nextState.status,
      "game-over",
      "Collision should end the game.",
    );

    expect.equals(
      nextState.score,
      fx.values.score.lowerCompletedRunScore,
      "Collision should preserve the completed run score.",
    );

    expect.equals(
      nextState.highScore,
      fx.values.score.existingHighScore,
      "A lower completed run must not replace the existing high score.",
    );

    expect.equals(
      state.highScore,
      fx.values.score.existingHighScore,
      "stepGame() must not mutate the original high score.",
    );
  },
);

/* -------------------------------------------------------------------------- */
/* restartGame                                                                */
/* -------------------------------------------------------------------------- */

Deno.test(
  "restartGame: game-over state resets to a fresh ready state",
  () => {
    const state = fx.createGameOverState({
      score: fx.values.score.restartTestScore,
      player: fx.createPlayer({
        y: fx.values.restart.playerY,
        velocityY: fx.values.restart.playerVelocityY,
        isGrounded: false,
      }),
      obstacles: [
        fx.createObstacle({
          id: "restart-obstacle",
          x: fx.values.obstacle.restartTestX,
        }),
      ],
    });

    const nextState = restartGame(state);

    expect.equals(
      nextState.status,
      "ready",
      "Restarted game should return to ready.",
    );

    expect.equals(
      nextState.score,
      fx.values.initial.score,
      "Restarted game should reset score.",
    );

    expect.equals(
      nextState.player.y,
      fx.values.initial.playerY,
      "Restarted game should reset player position.",
    );

    expect.equals(
      nextState.player.velocityY,
      fx.values.initial.playerVelocityY,
      "Restarted game should reset player velocity.",
    );

    expect.assert(
      nextState.player.isGrounded,
      "Restarted game should reset player to grounded.",
    );

    expect.equals(
      nextState.obstacles.length,
      fx.values.counts.none,
      "Restarted game should remove all obstacles.",
    );

    expect.equals(
      state.status,
      "game-over",
      "restartGame() must not mutate the original status.",
    );

    expect.equals(
      state.score,
      fx.values.score.restartTestScore,
      "restartGame() must not mutate the original score.",
    );

    expect.equals(
      state.obstacles.length,
      fx.values.counts.one,
      "restartGame() must not mutate the original obstacles.",
    );

    expect.differentReference(
      nextState,
      state,
      "Restarting should return a new game state.",
    );

    expect.differentReference(
      nextState.player,
      state.player,
      "Restarting should return a fresh player state.",
    );

    expect.differentReference(
      nextState.obstacles,
      state.obstacles,
      "Restarting should return a fresh obstacles array.",
    );
  },
);

Deno.test(
  "restartGame: preserves the in-session high score",
  () => {
    const state = {
      ...fx.createGameOverState({
        score: fx.values.score.newHighScore,
      }),
      highScore: fx.values.score.newHighScore,
    };

    const nextState = restartGame(state);

    expect.equals(
      nextState.status,
      "ready",
      "Restarted game should return to ready.",
    );

    expect.equals(
      nextState.score,
      fx.values.initial.score,
      "Restarted game should reset the current score.",
    );

    expect.equals(
      nextState.highScore,
      fx.values.score.newHighScore,
      "Restarted game should preserve the in-session high score.",
    );
  },
);

Deno.test(
  "restartGame: ready state ignores restart request",
  () => {
    const state = createInitialGameState();

    const nextState = restartGame(state);

    expect.sameReference(
      nextState,
      state,
      "Ready game should ignore restart requests.",
    );
  },
);

Deno.test(
  "restartGame: running state ignores restart request",
  () => {
    const state = fx.createRunningState();

    const nextState = restartGame(state);

    expect.sameReference(
      nextState,
      state,
      "Running game should ignore restart requests.",
    );
  },
);
