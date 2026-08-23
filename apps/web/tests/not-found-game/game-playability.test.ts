import {
  jumpPlayer,
  stepGame,
} from "../../src/features/not-found-game/game-state.ts";

import { gameFixture as fx } from "../fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

const SIMULATION_FRAME_SECONDS = 0.016;

const PLAYABLE_JUMP_START_POSITIONS = [
  3.1,
  3.5,
] as const;

Deno.test(
  "a reasonably timed jump can clear the tallest generated obstacle",
  () => {
    for (
      const obstacleStartX of PLAYABLE_JUMP_START_POSITIONS
    ) {
      let state = jumpPlayer(
        fx.createRunningState({
          obstacles: [
            fx.createObstacle({
              id: `playability-obstacle-${obstacleStartX}`,
              x: obstacleStartX,
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
        `A jump started with the obstacle at x=${obstacleStartX} should clear the tallest generated obstacle.`,
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
    }
  },
);
