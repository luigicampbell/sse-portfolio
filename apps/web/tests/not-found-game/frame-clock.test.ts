import {
  advanceFrameClock,
  createFrameClockState,
} from "../../src/features/not-found-game/frame-clock.ts";

import { gameFixture as fx } from "../fixtures/not-found-game.fixture.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

Deno.test(
  "advanceFrameClock: first timestamp initializes the clock without producing a frame delta",
  () => {
    const state = createFrameClockState();

    const result = advanceFrameClock(
      state,
      fx.values.frameClock.firstTimestampMs,
    );

    expect.equals(
      result.deltaSeconds,
      fx.values.frameClock.noDelta,
      "First timestamp should not advance the simulation.",
    );

    expect.equals(
      result.state.previousTimestampMs,
      fx.values.frameClock.firstTimestampMs,
      "First timestamp should initialize the frame clock.",
    );
  },
);

Deno.test(
  "advanceFrameClock: converts consecutive timestamps to seconds",
  () => {
    const initialized = advanceFrameClock(
      createFrameClockState(),
      fx.values.frameClock.firstTimestampMs,
    );

    const result = advanceFrameClock(
      initialized.state,
      fx.values.frameClock.nextTimestampMs,
    );

    expect.approximatelyEquals(
      result.deltaSeconds,
      fx.values.frameClock.expectedDeltaSeconds,
      "Frame clock should convert elapsed milliseconds to seconds.",
    );
  },
);

Deno.test(
  "advanceFrameClock: clamps unusually large frame deltas",
  () => {
    const initialized = advanceFrameClock(
      createFrameClockState(),
      fx.values.frameClock.firstTimestampMs,
    );

    const result = advanceFrameClock(
      initialized.state,
      fx.values.frameClock.largeTimestampMs,
    );

    expect.equals(
      result.deltaSeconds,
      fx.values.frameClock.maximumDeltaSeconds,
      "Large frame delta should be clamped.",
    );

    expect.equals(
      result.state.previousTimestampMs,
      fx.values.frameClock.largeTimestampMs,
      "Frame clock should still advance to the latest timestamp.",
    );
  },
);

Deno.test(
  "advanceFrameClock: invalid timestamps do not advance the frame clock",
  () => {
    const initialized = advanceFrameClock(
      createFrameClockState(),
      fx.values.frameClock.firstTimestampMs,
    );

    const invalidTimestamps = [
      fx.values.frameClock.firstTimestampMs,
      fx.values.frameClock.backwardTimestampMs,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];

    for (const timestampMs of invalidTimestamps) {
      const result = advanceFrameClock(
        initialized.state,
        timestampMs,
      );

      expect.equals(
        result.deltaSeconds,
        fx.values.frameClock.noDelta,
        `Invalid timestamp "${
          String(timestampMs)
        }" should not produce a frame delta.`,
      );

      expect.sameReference(
        result.state,
        initialized.state,
        `Invalid timestamp "${
          String(timestampMs)
        }" should preserve the frame clock state.`,
      );
    }
  },
);
