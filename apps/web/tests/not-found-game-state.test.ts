import {
  createInitialGameState,
  type GameState,
  hasCollision,
  jumpPlayer,
  spawnObstacle,
  startGame,
  stepGame,
} from "../src/features/not-found-game/game-state.ts";

Deno.test(
  "not-found game starts in a deterministic ready state",
  () => {
    const state = createInitialGameState();

    if (state.status !== "ready") {
      throw new Error(
        `Expected status "ready", received "${state.status}".`,
      );
    }

    if (state.score !== 0) {
      throw new Error(
        `Expected initial score 0, received ${state.score}.`,
      );
    }

    if (state.player.y !== 0) {
      throw new Error(
        `Expected player y position 0, received ${state.player.y}.`,
      );
    }

    if (state.player.velocityY !== 0) {
      throw new Error(
        `Expected initial vertical velocity 0, received ${state.player.velocityY}.`,
      );
    }

    if (!state.player.isGrounded) {
      throw new Error(
        "Expected player to start grounded.",
      );
    }

    if (state.obstacles.length !== 0) {
      throw new Error(
        `Expected no initial obstacles, received ${state.obstacles.length}.`,
      );
    }
  },
);

Deno.test(
  "starting the not-found game transitions ready state to running",
  () => {
    const initialState = createInitialGameState();

    const nextState = startGame(initialState);

    if (nextState.status !== "running") {
      throw new Error(
        `Expected status "running", received "${nextState.status}".`,
      );
    }

    if (initialState.status !== "ready") {
      throw new Error(
        "startGame() must not mutate the original state.",
      );
    }

    if (nextState === initialState) {
      throw new Error(
        "startGame() must return a new state object.",
      );
    }
  },
);

Deno.test(
  "grounded player can jump",
  () => {
    const initialState = startGame(
      createInitialGameState(),
    );

    const nextState = jumpPlayer(initialState);

    if (nextState.player.velocityY >= 0) {
      throw new Error(
        `Expected upward velocity, received ${nextState.player.velocityY}.`,
      );
    }

    if (nextState.player.isGrounded) {
      throw new Error(
        "Expected player to become airborne after jumping.",
      );
    }

    if (!initialState.player.isGrounded) {
      throw new Error(
        "jumpPlayer() must not mutate the original player state.",
      );
    }

    if (nextState === initialState) {
      throw new Error(
        "jumpPlayer() must return a new game state.",
      );
    }

    if (nextState.player === initialState.player) {
      throw new Error(
        "jumpPlayer() must return a new player state.",
      );
    }
  },
);

Deno.test(
  "airborne player cannot jump again",
  () => {
    const runningState = startGame(
      createInitialGameState(),
    );

    const airborneState = jumpPlayer(runningState);
    const nextState = jumpPlayer(airborneState);

    if (nextState.player.velocityY !== airborneState.player.velocityY) {
      throw new Error(
        "Expected airborne jump attempt to preserve vertical velocity.",
      );
    }

    if (nextState.player.isGrounded) {
      throw new Error(
        "Expected player to remain airborne.",
      );
    }

    if (nextState !== airborneState) {
      throw new Error(
        "Expected ignored jump to return the existing state.",
      );
    }
  },
);

Deno.test(
  "gravity increases an airborne player's vertical velocity over time",
  () => {
    const runningState = startGame(
      createInitialGameState(),
    );

    const airborneState = jumpPlayer(runningState);

    const nextState = stepGame(
      airborneState,
      0.25,
    );

    if (
      nextState.player.velocityY <=
        airborneState.player.velocityY
    ) {
      throw new Error(
        "Expected gravity to increase vertical velocity.",
      );
    }

    if (
      airborneState.player.velocityY !== -1
    ) {
      throw new Error(
        "stepGame() must not mutate the original player state.",
      );
    }

    if (nextState === airborneState) {
      throw new Error(
        "Expected physics step to return a new game state.",
      );
    }

    if (
      nextState.player === airborneState.player
    ) {
      throw new Error(
        "Expected physics step to return a new player state.",
      );
    }
  },
);

Deno.test(
  "physics step moves an airborne player using updated vertical velocity",
  () => {
    const runningState = startGame(
      createInitialGameState(),
    );

    const airborneState = jumpPlayer(runningState);

    const nextState = stepGame(
      airborneState,
      0.25,
    );

    if (nextState.player.velocityY !== -0.5) {
      throw new Error(
        `Expected vertical velocity -0.5, received ${nextState.player.velocityY}.`,
      );
    }

    if (nextState.player.y !== -0.125) {
      throw new Error(
        `Expected player y position -0.125, received ${nextState.player.y}.`,
      );
    }

    if (airborneState.player.y !== 0) {
      throw new Error(
        "stepGame() must not mutate the original player position.",
      );
    }
  },
);

Deno.test(
  "player lands when physics would move them past ground level",
  () => {
    const airborneState: GameState = {
      ...startGame(createInitialGameState()),
      player: {
        y: -0.1,
        velocityY: 1,
        isGrounded: false,
      },
    };

    const nextState = stepGame(
      airborneState,
      0.25,
    );

    if (nextState.player.y !== 0) {
      throw new Error(
        `Expected player to land at y 0, received ${nextState.player.y}.`,
      );
    }

    if (nextState.player.velocityY !== 0) {
      throw new Error(
        `Expected vertical velocity 0 after landing, received ${nextState.player.velocityY}.`,
      );
    }

    if (!nextState.player.isGrounded) {
      throw new Error(
        "Expected player to be grounded after landing.",
      );
    }

    if (airborneState.player.y !== -0.1) {
      throw new Error(
        "stepGame() must not mutate the original airborne state.",
      );
    }
  },
);

Deno.test(
  "physics does not advance for a non-positive delta",
  () => {
    const runningState = startGame(
      createInitialGameState(),
    );

    const airborneState = jumpPlayer(runningState);

    const zeroDeltaState = stepGame(
      airborneState,
      0,
    );

    const negativeDeltaState = stepGame(
      airborneState,
      -0.25,
    );

    if (zeroDeltaState !== airborneState) {
      throw new Error(
        "Expected zero-delta physics step to return the existing state.",
      );
    }

    if (negativeDeltaState !== airborneState) {
      throw new Error(
        "Expected negative-delta physics step to return the existing state.",
      );
    }
  },
);

Deno.test(
  "physics step moves obstacles left while the game is running",
  () => {
    const runningState: GameState = {
      ...startGame(createInitialGameState()),
      obstacles: [
        {
          id: "obstacle-1",
          x: 10,
          width: 1,
          height: 1,
        },
      ],
    };

    const nextState = stepGame(
      runningState,
      0.5,
    );

    const obstacle = nextState.obstacles[0];

    if (!obstacle) {
      throw new Error(
        "Expected obstacle to remain in game state.",
      );
    }

    if (obstacle.x >= 10) {
      throw new Error(
        `Expected obstacle to move left from x 10, received ${obstacle.x}.`,
      );
    }

    if (runningState.obstacles[0]?.x !== 10) {
      throw new Error(
        "stepGame() must not mutate the original obstacle state.",
      );
    }

    if (nextState.obstacles === runningState.obstacles) {
      throw new Error(
        "Expected physics step to return a new obstacles array.",
      );
    }
  },
);

Deno.test(
  "physics step removes obstacles after they move off-screen",
  () => {
    const runningState: GameState = {
      ...startGame(createInitialGameState()),
      obstacles: [
        {
          id: "off-screen",
          x: 1,
          width: 1,
          height: 1,
        },
        {
          id: "visible",
          x: 5,
          width: 1,
          height: 1,
        },
      ],
    };

    const nextState = stepGame(
      runningState,
      0.5,
    );

    if (nextState.obstacles.length !== 1) {
      throw new Error(
        `Expected 1 remaining obstacle, received ${nextState.obstacles.length}.`,
      );
    }

    const remainingObstacle = nextState.obstacles[0];

    if (!remainingObstacle) {
      throw new Error(
        "Expected a visible obstacle to remain.",
      );
    }

    if (remainingObstacle.id !== "visible") {
      throw new Error(
        `Expected "visible" obstacle to remain, received "${remainingObstacle.id}".`,
      );
    }

    if (remainingObstacle.x !== 3) {
      throw new Error(
        `Expected remaining obstacle at x 3, received ${remainingObstacle.x}.`,
      );
    }

    if (runningState.obstacles.length !== 2) {
      throw new Error(
        "stepGame() must not mutate the original obstacles array.",
      );
    }
  },
);

Deno.test(
  "running game can spawn an obstacle deterministically",
  () => {
    const runningState = startGame(
      createInitialGameState(),
    );

    const nextState = spawnObstacle(
      runningState,
      {
        id: "obstacle-1",
        x: 10,
        width: 1,
        height: 1,
      },
    );

    if (nextState.obstacles.length !== 1) {
      throw new Error(
        `Expected 1 obstacle, received ${nextState.obstacles.length}.`,
      );
    }

    const obstacle = nextState.obstacles[0];

    if (!obstacle) {
      throw new Error(
        "Expected spawned obstacle to exist.",
      );
    }

    if (obstacle.id !== "obstacle-1") {
      throw new Error(
        `Expected obstacle id "obstacle-1", received "${obstacle.id}".`,
      );
    }

    if (obstacle.x !== 10) {
      throw new Error(
        `Expected obstacle x 10, received ${obstacle.x}.`,
      );
    }

    if (runningState.obstacles.length !== 0) {
      throw new Error(
        "spawnObstacle() must not mutate the original state.",
      );
    }

    if (nextState.obstacles === runningState.obstacles) {
      throw new Error(
        "Expected spawnObstacle() to create a new obstacles array.",
      );
    }
  },
);

Deno.test(
  "score increases when an obstacle passes off-screen",
  () => {
    const runningState: GameState = {
      ...startGame(createInitialGameState()),
      score: 0,
      obstacles: [
        {
          id: "passed",
          x: 1,
          width: 1,
          height: 1,
        },
        {
          id: "visible",
          x: 5,
          width: 1,
          height: 1,
        },
      ],
    };

    const nextState = stepGame(
      runningState,
      0.5,
    );

    if (nextState.score !== 1) {
      throw new Error(
        `Expected score 1 after passing an obstacle, received ${nextState.score}.`,
      );
    }

    if (runningState.score !== 0) {
      throw new Error(
        "stepGame() must not mutate the original score.",
      );
    }

    if (nextState.obstacles.length !== 1) {
      throw new Error(
        `Expected 1 obstacle to remain, received ${nextState.obstacles.length}.`,
      );
    }

    if (nextState.obstacles[0]?.id !== "visible") {
      throw new Error(
        "Expected the visible obstacle to remain.",
      );
    }
  },
);

Deno.test(
  "grounded player collides with an overlapping obstacle",
  () => {
    const player = createInitialGameState().player;

    const obstacle = {
      id: "collision-test",
      x: 1,
      width: 1,
      height: 1,
    };

    if (!hasCollision(player, obstacle)) {
      throw new Error(
        "Expected grounded player to collide with overlapping obstacle.",
      );
    }
  },
);

Deno.test(
  "airborne player can clear a horizontally overlapping obstacle",
  () => {
    const player = {
      ...createInitialGameState().player,
      y: -2,
      isGrounded: false,
    };

    const obstacle = {
      id: "clearable",
      x: 1,
      width: 1,
      height: 1,
    };

    if (hasCollision(player, obstacle)) {
      throw new Error(
        "Expected airborne player above obstacle to avoid collision.",
      );
    }
  },
);

Deno.test(
  "collision transitions a running game to game-over",
  () => {
    const runningState: GameState = {
      ...startGame(createInitialGameState()),
      obstacles: [
        {
          id: "collision",
          x: 1,
          width: 1,
          height: 1,
        },
      ],
    };

    const nextState = stepGame(
      runningState,
      0.01,
    );

    if (nextState.status !== "game-over") {
      throw new Error(
        `Expected status "game-over", received "${nextState.status}".`,
      );
    }

    if (runningState.status !== "running") {
      throw new Error(
        "stepGame() must not mutate the original game status.",
      );
    }
  },
);

Deno.test(
  "physics does not advance for an invalid delta",
  () => {
    const state = startGame(
      createInitialGameState(),
    );

    for (
      const deltaSeconds of [
        0,
        -0.25,
        Number.NaN,
        Number.POSITIVE_INFINITY,
      ]
    ) {
      const nextState = stepGame(
        state,
        deltaSeconds,
      );

      if (nextState !== state) {
        throw new Error(
          `Expected delta ${deltaSeconds} to leave state unchanged.`,
        );
      }
    }
  },
);
