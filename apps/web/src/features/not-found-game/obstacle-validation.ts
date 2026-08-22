import type { ObstacleState } from "./game-state.ts";

export function isValidObstacleId(
  id: string,
): boolean {
  return id.trim().length > 0;
}

export function isValidObstacle(
  obstacle: ObstacleState,
): boolean {
  return isValidObstacleId(obstacle.id) &&
    hasValidObstaclePosition(obstacle) &&
    hasValidObstacleDimensions(obstacle);
}

function hasValidObstaclePosition(
  obstacle: ObstacleState,
): boolean {
  return Number.isFinite(obstacle.x);
}

function hasValidObstacleDimensions(
  obstacle: ObstacleState,
): boolean {
  return isPositiveFiniteNumber(
    obstacle.width,
  ) &&
    isPositiveFiniteNumber(
      obstacle.height,
    );
}

function isPositiveFiniteNumber(
  value: number,
): boolean {
  return Number.isFinite(value) &&
    value > 0;
}
