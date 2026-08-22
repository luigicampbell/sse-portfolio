import {
  generateObstacle,
} from "../src/features/not-found-game/obstacle-generator.ts";

import { gameFixture as fx } from "./fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "./helpers/assertions.ts";

Deno.test(
  "generateObstacle: creates deterministic obstacle geometry from a normalized sample",
  () => {
    const obstacle = generateObstacle(
      fx.values.generation.obstacleId,
      fx.values.generation.midpointSample,
    );

    expect.equals(
      obstacle.id,
      fx.values.generation.obstacleId,
      "Generated obstacle should preserve its id.",
    );

    expect.equals(
      obstacle.x,
      fx.values.generation.spawnX,
      "Generated obstacle should start at the spawn position.",
    );

    expect.equals(
      obstacle.width,
      fx.values.generation.width,
      "Generated obstacle should use the configured width.",
    );

    expect.equals(
      obstacle.height,
      fx.values.generation.midpointHeight,
      "Midpoint sample should generate midpoint obstacle height.",
    );
  },
);

Deno.test(
  "generateObstacle: zero sample generates minimum obstacle height",
  () => {
    const obstacle = generateObstacle(
      fx.values.generation.obstacleId,
      fx.values.generation.minimumSample,
    );

    expect.equals(
      obstacle.height,
      fx.values.generation.minimumHeight,
      "Minimum sample should generate minimum obstacle height.",
    );
  },
);

Deno.test(
  "generateObstacle: one sample generates maximum obstacle height",
  () => {
    const obstacle = generateObstacle(
      fx.values.generation.obstacleId,
      fx.values.generation.maximumSample,
    );

    expect.equals(
      obstacle.height,
      fx.values.generation.maximumHeight,
      "Maximum sample should generate maximum obstacle height.",
    );
  },
);
