import type {
  ObstacleSpawnInput,
  ObstacleSpawnInputProvider,
} from "./obstacle-spawner.ts";

type RuntimeObstacleSpawnDependencies = {
  readonly createId: () => string;
  readonly createNormalizedSample: () => number;
};

export function createRuntimeObstacleSpawnInputProvider(
  dependencies: RuntimeObstacleSpawnDependencies,
): ObstacleSpawnInputProvider {
  return (
    spawnCount: number,
  ): readonly ObstacleSpawnInput[] => {
    return Array.from(
      {
        length: spawnCount,
      },
      () => ({
        id: dependencies.createId(),
        normalizedSample: dependencies
          .createNormalizedSample(),
      }),
    );
  };
}

export function createBrowserObstacleSpawnInputProvider(): ObstacleSpawnInputProvider {
  return createRuntimeObstacleSpawnInputProvider(
    {
      createId: () => crypto.randomUUID(),

      createNormalizedSample: () => Math.random(),
    },
  );
}
