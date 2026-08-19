import {
  createInitialGameState,
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
