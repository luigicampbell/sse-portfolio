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

type NormalizedSampleRange = {
  readonly minimum: number;
  readonly maximum: number;
};

const NORMALIZED_SAMPLE_RANGE = {
  minimum: 0,
  maximum: 1,
} as const satisfies NormalizedSampleRange;

export function generateObstacle(
  id: string,
  normalizedSample: number,
): ObstacleState {
  validateNormalizedSample(
    normalizedSample,
  );

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
  const heightRange = OBSTACLE_GENERATION.maximumHeight -
    OBSTACLE_GENERATION.minimumHeight;

  return (
    OBSTACLE_GENERATION.minimumHeight +
    heightRange * normalizedSample
  );
}

function validateNormalizedSample(
  normalizedSample: number,
): void {
  if (
    !isValidNormalizedSample(
      normalizedSample,
    )
  ) {
    throw new RangeError(
      `Normalized obstacle sample must be between ${NORMALIZED_SAMPLE_RANGE.minimum} and ${NORMALIZED_SAMPLE_RANGE.maximum}.`,
    );
  }
}

function isValidNormalizedSample(
  normalizedSample: number,
): boolean {
  return Number.isFinite(
    normalizedSample,
  ) &&
    normalizedSample >=
      NORMALIZED_SAMPLE_RANGE.minimum &&
    normalizedSample <=
      NORMALIZED_SAMPLE_RANGE.maximum;
}
