import {
  jumpPlayer,
  stepGame,
} from "../../src/features/not-found-game/game-state.ts";

import { gameFixture as fx } from "../fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

const SIMULATION_FRAME_SECONDS = 0.016;
const PLAYABLE_JUMP_START_X = 3.5;

Deno.test(
  "jumping at a reachable obstacle can clear the tallest generated obstacle",
  () => {
    let state = jumpPlayer(
      fx.createRunningState({
        obstacles: [
          fx.createObstacle({
            id: "playability-obstacle",
            x: PLAYABLE_JUMP_START_X,
            height: fx.values.generation
              .maximumHeight,
          }),
        ],
      }),
    );

    while (
      state.status === "running" &&
      state.obstacles.length > 0
    ) {
      state = stepGame(
        state,
        SIMULATION_FRAME_SECONDS,
      );
    }

    expect.equals(
      state.status,
      "running",
      "A correctly timed jump should clear the tallest generated obstacle.",
    );

    expect.equals(
      state.obstacles.length,
      fx.values.counts.none,
      "The obstacle should pass completely without colliding with the player.",
    );

    expect.equals(
      state.score,
      fx.values.score
        .afterOnePassedObstacle,
      "Clearing the obstacle should award one point.",
    );
  },
);
