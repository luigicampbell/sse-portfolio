import {
  isNotFoundGameJumpKey,
  shouldHandleNotFoundGamePointer,
} from "../../src/features/not-found-game/game-input.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

Deno.test(
  "isNotFoundGameJumpKey: accepts supported jump keys",
  () => {
    expect.assert(
      isNotFoundGameJumpKey(" "),
      "Space should trigger jump.",
    );

    expect.assert(
      isNotFoundGameJumpKey("ArrowUp"),
      "ArrowUp should trigger jump.",
    );
  },
);

Deno.test(
  "isNotFoundGameJumpKey: rejects unrelated keys",
  () => {
    expect.assert(
      !isNotFoundGameJumpKey("Enter"),
      "Enter should not trigger jump.",
    );

    expect.assert(
      !isNotFoundGameJumpKey("ArrowDown"),
      "ArrowDown should not trigger jump.",
    );
  },
);

Deno.test(
  "shouldHandleNotFoundGamePointer: accepts the primary pointer action",
  () => {
    expect.assert(
      shouldHandleNotFoundGamePointer({
        button: 0,
        isPrimary: true,
      }),
      "Primary pointer input should trigger jump.",
    );
  },
);

Deno.test(
  "shouldHandleNotFoundGamePointer: rejects secondary pointer actions",
  () => {
    expect.assert(
      !shouldHandleNotFoundGamePointer({
        button: 2,
        isPrimary: true,
      }),
      "Secondary mouse input should not trigger jump.",
    );

    expect.assert(
      !shouldHandleNotFoundGamePointer({
        button: 0,
        isPrimary: false,
      }),
      "Non-primary pointer input should not trigger jump.",
    );
  },
);
