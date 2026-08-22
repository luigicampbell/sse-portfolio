import {
  advanceObstacleSpawnCadence,
  createObstacleSpawnCadenceState,
} from "../src/features/not-found-game/obstacle-spawn-cadence.ts";

import { gameFixture as fx } from "./fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "./helpers/assertions.ts";

Deno.test(
  "advanceObstacleSpawnCadence: spawn becomes due when elapsed time reaches the interval",
  () => {
    const initialState = createObstacleSpawnCadenceState();

    const beforeThreshold = advanceObstacleSpawnCadence(
      initialState,
      fx.values.spawnCadence
        .beforeThresholdDelta,
    );

    expect.equals(
      beforeThreshold.spawnCount,
      fx.values.counts.none,
      "Spawn should not be due before the interval is reached.",
    );

    expect.equals(
      beforeThreshold.state.elapsedSeconds,
      fx.values.spawnCadence
        .elapsedBeforeThreshold,
      "Elapsed spawn time should accumulate before the interval.",
    );

    const atThreshold = advanceObstacleSpawnCadence(
      beforeThreshold.state,
      fx.values.spawnCadence
        .remainingThresholdDelta,
    );

    expect.equals(
      atThreshold.spawnCount,
      fx.values.counts.one,
      "Exactly one spawn should become due at the interval.",
    );

    expect.equals(
      atThreshold.state.elapsedSeconds,
      fx.values.spawnCadence
        .elapsedAfterExactSpawn,
      "Exact spawn interval should consume the accumulated elapsed time.",
    );
  },
);

Deno.test(
  "advanceObstacleSpawnCadence: large delta can produce multiple spawns and preserve remainder",
  () => {
    const state = createObstacleSpawnCadenceState();

    const result = advanceObstacleSpawnCadence(
      state,
      fx.values.spawnCadence
        .multipleSpawnDelta,
    );

    expect.equals(
      result.spawnCount,
      fx.values.spawnCadence
        .multipleSpawnCount,
      "Large delta should produce every spawn interval crossed.",
    );

    expect.approximatelyEquals(
      result.state.elapsedSeconds,
      fx.values.spawnCadence
        .multipleSpawnRemainder,
      "Spawn cadence should preserve elapsed time beyond completed intervals.",
    );
  },
);
