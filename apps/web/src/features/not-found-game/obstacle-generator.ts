import type { ObstacleState } from "./game-state.ts";

type ObstacleGenerationConfig = {
  readonly spawnX: number;
  readonly width: number;
  readonly minimumHeight: number;
  readonly maximumHeight: number;
};

const OBSTACLE_GENERATION = {
  spawnX: 12,
  width: 1,
  minimumHeight: 0.5,
  maximumHeight: 1.5,
} as const satisfies ObstacleGenerationConfig;

export function generateObstacle(
  id: string,
  normalizedSample: number,
): ObstacleState {
  return {
    id,
    x: OBSTACLE_GENERATION.spawnX,
    width: OBSTACLE_GENERATION.width,
    height: calculateObstacleHeight(
      normalizedSample,
    ),
  };
}

function calculateObstacleHeight(
  normalizedSample: number,
): number {
  const heightRange =
    OBSTACLE_GENERATION.maximumHeight -
    OBSTACLE_GENERATION.minimumHeight;

  return (
    OBSTACLE_GENERATION.minimumHeight +
    heightRange * normalizedSample
  );
}
