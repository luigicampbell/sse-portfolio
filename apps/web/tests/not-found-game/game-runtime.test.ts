import {
  advanceNotFoundGameFrame,
  createNotFoundGameRuntimeState,
  jumpNotFoundGameRuntime,
  type NotFoundGameRuntimeState,
  restartNotFoundGameRuntime,
} from "../../src/features/not-found-game/game-runtime.ts";

import { gameFixture as fx } from "../fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

Deno.test(
  "advanceNotFoundGameFrame: advances physics and spawning with the same frame delta",
  () => {
    const initialState = {
      ...createNotFoundGameRuntimeState(),
      gameState: fx.createRunningState({
        obstacles: [
          fx.createObstacle({
            id: "existing-obstacle",
          }),
        ],
      }),
    };

    const nextState = advanceNotFoundGameFrame(
      initialState,
      fx.values.spawnCadence
        .fullIntervalDelta,
      () => [
        {
          id: fx.values.generation
            .obstacleId,
          normalizedSample: fx.values.generation
            .midpointSample,
        },
      ],
    );

    expect.equals(
      nextState.gameState.obstacles.length,
      fx.values.counts.two,
      "Frame should retain the existing obstacle and add the due obstacle.",
    );

    const existingObstacle = nextState.gameState.obstacles.find(
      (obstacle) =>
        obstacle.id ===
          "existing-obstacle",
    );

    const generatedObstacle = nextState.gameState.obstacles.find(
      (obstacle) =>
        obstacle.id ===
          fx.values.generation
            .obstacleId,
    );

    expect.assert(
      existingObstacle !== undefined,
      "Expected existing obstacle to remain.",
    );

    expect.assert(
      generatedObstacle !== undefined,
      "Expected generated obstacle to be added.",
    );

    expect.approximatelyEquals(
      existingObstacle.x,
      fx.values.obstacle
        .xAfterFullSpawnInterval,
      "Existing obstacle should advance using the frame delta.",
    );

    expect.equals(
      generatedObstacle.x,
      fx.values.generation.spawnX,
      "New obstacle should enter at the spawn position after game advancement.",
    );

    expect.approximatelyEquals(
      nextState.spawningState
        .cadence.elapsedSeconds,
      fx.values.spawnCadence
        .elapsedAfterExactSpawn,
      "Spawn cadence should consume the same frame delta.",
    );
  },
);

Deno.test(
  "jumpNotFoundGameRuntime: applies the existing jump transition without changing spawn state",
  () => {
    const state: NotFoundGameRuntimeState = {
      gameState: fx.createRunningState(),

      spawningState: {
        cadence: {
          elapsedSeconds: fx.values.spawnCadence
            .elapsedBeforeThreshold,
        },
      },
    };

    const jumped = jumpNotFoundGameRuntime(
      state,
    );

    expect.differentReference(
      jumped,
      state,
      "Jump should create a new runtime state.",
    );

    expect.differentReference(
      jumped.gameState,
      state.gameState,
      "Jump should create a new game state.",
    );

    expect.equals(
      jumped.gameState.player.velocityY,
      fx.values.player.jumpVelocityY,
      "Jump should apply the existing deterministic jump velocity.",
    );

    expect.assert(
      !jumped.gameState.player.isGrounded,
      "Jumped player should become airborne.",
    );

    expect.sameReference(
      jumped.spawningState,
      state.spawningState,
      "Jump should not alter obstacle spawning state.",
    );

    expect.assert(
      state.gameState.player.isGrounded,
      "Jump must not mutate the original player state.",
    );
  },
);

Deno.test(
  "restartNotFoundGameRuntime: resets the game and spawn cadence while preserving high score",
  () => {
    const state: NotFoundGameRuntimeState = {
      gameState: fx.createGameOverState({
        score: fx.values.score
          .restartTestScore,

        highScore: fx.values.score
          .existingHighScore,

        obstacles: [
          fx.createObstacle({
            x: fx.values.obstacle
              .restartTestX,
          }),
        ],
      }),

      spawningState: {
        cadence: {
          elapsedSeconds: fx.values.spawnCadence
            .elapsedBeforeThreshold,
        },
      },
    };

    const restarted = restartNotFoundGameRuntime(
      state,
    );

    expect.differentReference(
      restarted,
      state,
      "Restart should create a new runtime state.",
    );

    expect.equals(
      restarted.gameState.status,
      "ready",
      "Restarted runtime should return the game to ready.",
    );

    expect.equals(
      restarted.gameState.score,
      fx.values.initial.score,
      "Restart should reset the current score.",
    );

    expect.equals(
      restarted.gameState.highScore,
      fx.values.score.existingHighScore,
      "Restart should preserve the session high score.",
    );

    expect.equals(
      restarted.gameState.obstacles.length,
      fx.values.counts.none,
      "Restart should clear active obstacles.",
    );

    expect.equals(
      restarted.spawningState
        .cadence.elapsedSeconds,
      fx.values.spawnCadence
        .elapsedAfterExactSpawn,
      "Restart should reset accumulated spawn cadence.",
    );
  },
);

Deno.test(
  "restartNotFoundGameRuntime: ignores restart outside game-over",
  () => {
    const state: NotFoundGameRuntimeState = {
      gameState: fx.createRunningState(),

      spawningState: {
        cadence: {
          elapsedSeconds: fx.values.spawnCadence
            .elapsedBeforeThreshold,
        },
      },
    };

    const restarted = restartNotFoundGameRuntime(
      state,
    );

    expect.sameReference(
      restarted,
      state,
      "Restart outside game-over should preserve the runtime state.",
    );
  },
);
