import {
  createRuntimeObstacleSpawnInputProvider,
} from "../../src/features/not-found-game/runtime-spawn-inputs.ts";

import { gameFixture as fx } from "../fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

Deno.test(
  "createRuntimeObstacleSpawnInputProvider: creates exactly one id and sample for each requested spawn",
  () => {
    const ids = [
      fx.values.generation
        .multipleSpawnIds.first,
      fx.values.generation
        .multipleSpawnIds.second,
    ];

    const samples = [
      fx.values.generation.minimumSample,
      fx.values.generation.maximumSample,
    ];

    let idIndex = 0;
    let sampleIndex = 0;

    const getSpawnInputs = createRuntimeObstacleSpawnInputProvider(
      {
        createId: () => {
          const id = ids[idIndex];

          expect.assert(
            id !== undefined,
            "Expected a deterministic obstacle id.",
          );

          idIndex += 1;

          return id;
        },

        createNormalizedSample: () => {
          const sample = samples[sampleIndex];

          expect.assert(
            sample !== undefined,
            "Expected a deterministic normalized sample.",
          );

          sampleIndex += 1;

          return sample;
        },
      },
    );

    const inputs = getSpawnInputs(
      fx.values.counts.two,
    );

    expect.equals(
      inputs.length,
      fx.values.counts.two,
      "Provider should return exactly the requested number of spawn inputs.",
    );

    const firstInput = inputs[0];
    const secondInput = inputs[1];

    expect.assert(
      firstInput !== undefined,
      "Expected first spawn input.",
    );

    expect.assert(
      secondInput !== undefined,
      "Expected second spawn input.",
    );

    expect.equals(
      firstInput.id,
      fx.values.generation
        .multipleSpawnIds.first,
      "First spawn input should use the first generated id.",
    );

    expect.equals(
      firstInput.normalizedSample,
      fx.values.generation.minimumSample,
      "First spawn input should use the first generated sample.",
    );

    expect.equals(
      secondInput.id,
      fx.values.generation
        .multipleSpawnIds.second,
      "Second spawn input should use the second generated id.",
    );

    expect.equals(
      secondInput.normalizedSample,
      fx.values.generation.maximumSample,
      "Second spawn input should use the second generated sample.",
    );

    expect.equals(
      idIndex,
      fx.values.counts.two,
      "Provider should generate one id per requested spawn.",
    );

    expect.equals(
      sampleIndex,
      fx.values.counts.two,
      "Provider should generate one sample per requested spawn.",
    );
  },
);
