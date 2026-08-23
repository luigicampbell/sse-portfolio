import {
  getNotFoundGameSoundEffect,
} from "../../src/features/not-found-game/game-audio.ts";

import {
  createInitialGameState,
  jumpPlayer,
  startGame,
} from "../../src/features/not-found-game/game-state.ts";

import { gameFixture as fx } from "../fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

Deno.test(
  "getNotFoundGameSoundEffect: detects game start",
  () => {
    const previousState = createInitialGameState();

    const nextState = startGame(
      previousState,
    );

    expect.equals(
      getNotFoundGameSoundEffect(
        previousState,
        nextState,
      ),
      "start",
      "Ready-to-running transition should produce the start sound.",
    );
  },
);

Deno.test(
  "getNotFoundGameSoundEffect: detects player jump",
  () => {
    const previousState = fx.createRunningState();

    const nextState = jumpPlayer(
      previousState,
    );

    expect.equals(
      getNotFoundGameSoundEffect(
        previousState,
        nextState,
      ),
      "jump",
      "Grounded-to-airborne transition should produce the jump sound.",
    );
  },
);

Deno.test(
  "getNotFoundGameSoundEffect: detects score increase",
  () => {
    const previousState = fx.createRunningState({
      score: fx.values.initial.score,
    });

    const nextState = fx.createRunningState({
      score: fx.values.score
        .afterOnePassedObstacle,
    });

    expect.equals(
      getNotFoundGameSoundEffect(
        previousState,
        nextState,
      ),
      "score",
      "A score increase should produce the score sound.",
    );
  },
);

Deno.test(
  "getNotFoundGameSoundEffect: detects game over",
  () => {
    const previousState = fx.createRunningState();

    const nextState = fx.createGameOverState();

    expect.equals(
      getNotFoundGameSoundEffect(
        previousState,
        nextState,
      ),
      "game-over",
      "Running-to-game-over transition should produce the game-over sound.",
    );
  },
);

Deno.test(
  "getNotFoundGameSoundEffect: ignores ordinary running frames",
  () => {
    const previousState = fx.createRunningState();

    const nextState = fx.createRunningState({
      player: {
        ...previousState.player,
        y: fx.values.player
          .yAfterQuarterSecond,
      },
    });

    expect.equals(
      getNotFoundGameSoundEffect(
        previousState,
        nextState,
      ),
      null,
      "Ordinary game advancement should not produce a sound.",
    );
  },
);
