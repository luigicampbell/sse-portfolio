import {
  shouldPauseNotFoundGame,
} from "../../src/features/not-found-game/game-motion.ts";

import { testAssert as expect } from "../helpers/assertions.ts";

Deno.test(
  "shouldPauseNotFoundGame: pauses while the document is hidden",
  () => {
    expect.assert(
      shouldPauseNotFoundGame({
        documentHidden: true,
        prefersReducedMotion: false,
      }),
      "Hidden documents should pause the game.",
    );
  },
);

Deno.test(
  "shouldPauseNotFoundGame: pauses when reduced motion is requested",
  () => {
    expect.assert(
      shouldPauseNotFoundGame({
        documentHidden: false,
        prefersReducedMotion: true,
      }),
      "Reduced-motion preference should pause the game.",
    );
  },
);

Deno.test(
  "shouldPauseNotFoundGame: remains paused when both conditions apply",
  () => {
    expect.assert(
      shouldPauseNotFoundGame({
        documentHidden: true,
        prefersReducedMotion: true,
      }),
      "The game should remain paused while either pause condition applies.",
    );
  },
);

Deno.test(
  "shouldPauseNotFoundGame: runs when neither pause condition applies",
  () => {
    expect.assert(
      !shouldPauseNotFoundGame({
        documentHidden: false,
        prefersReducedMotion: false,
      }),
      "The game should run when no lifecycle pause condition applies.",
    );
  },
);
