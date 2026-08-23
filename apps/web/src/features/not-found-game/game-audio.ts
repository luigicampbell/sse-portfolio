import type { GameState } from "./game-state.ts";

export type NotFoundGameSoundEffect =
  | "start"
  | "jump"
  | "score"
  | "game-over";

export function getNotFoundGameSoundEffect(
  previousState: GameState,
  nextState: GameState,
): NotFoundGameSoundEffect | null {
  if (
    previousState.status === "ready" &&
    nextState.status === "running"
  ) {
    return "start";
  }

  if (
    previousState.status === "running" &&
    nextState.status === "game-over"
  ) {
    return "game-over";
  }

  if (
    nextState.score >
      previousState.score
  ) {
    return "score";
  }

  if (
    previousState.status === "running" &&
    nextState.status === "running" &&
    previousState.player.isGrounded &&
    !nextState.player.isGrounded
  ) {
    return "jump";
  }

  return null;
}
