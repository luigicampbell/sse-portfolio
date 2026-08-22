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

Deno.test(
  "advanceObstacleSpawnCadence: invalid delta does not advance cadence",
  () => {
    const state = createObstacleSpawnCadenceState();

    const invalidDeltas = [
      0,
      fx.values.time
        .negativeQuarterSecond,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];

    for (
      const deltaSeconds of invalidDeltas
    ) {
      const result = advanceObstacleSpawnCadence(
        state,
        deltaSeconds,
      );

      expect.equals(
        result.spawnCount,
        fx.values.counts.none,
        `Invalid delta "${String(deltaSeconds)}" should not produce a spawn.`,
      );

      expect.sameReference(
        result.state,
        state,
        `Invalid delta "${
          String(deltaSeconds)
        }" should preserve the cadence state.`,
      );
    }
  },
);
