export type NotFoundGamePauseConditions = {
  readonly documentHidden: boolean;
  readonly prefersReducedMotion: boolean;
};

export function shouldPauseNotFoundGame(
  conditions: NotFoundGamePauseConditions,
): boolean {
  return conditions.documentHidden ||
    conditions.prefersReducedMotion;
}
