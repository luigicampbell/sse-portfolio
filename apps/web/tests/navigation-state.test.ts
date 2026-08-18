import { shouldDetachNavigation } from "../src/components/navigation-state.ts";

Deno.test(
  "navigation remains integrated at the top of the page",
  () => {
    const detached = shouldDetachNavigation(
      0,
      24,
    );

    if (detached) {
      throw new Error(
        "Expected navigation to remain integrated at scroll position 0.",
      );
    }
  },
);

Deno.test(
  "navigation remains integrated through the detach threshold",
  () => {
    const detached = shouldDetachNavigation(
      24,
      24,
    );

    if (detached) {
      throw new Error(
        "Expected navigation to remain integrated at the detach threshold.",
      );
    }
  },
);

Deno.test(
  "navigation detaches after scrolling beyond the threshold",
  () => {
    const detached = shouldDetachNavigation(
      25,
      24,
    );

    if (!detached) {
      throw new Error(
        "Expected navigation to detach after scrolling beyond the threshold.",
      );
    }
  },
);

Deno.test(
  "navigation ignores negative scroll positions",
  () => {
    const detached = shouldDetachNavigation(
      -20,
      24,
    );

    if (detached) {
      throw new Error(
        "Expected navigation to remain integrated for negative overscroll.",
      );
    }
  },
);

Deno.test(
  "navigation supports a zero detach threshold",
  () => {
    const atTop = shouldDetachNavigation(
      0,
      0,
    );

    const afterScroll = shouldDetachNavigation(
      1,
      0,
    );

    if (atTop) {
      throw new Error(
        "Expected navigation to remain integrated at the top.",
      );
    }

    if (!afterScroll) {
      throw new Error(
        "Expected navigation to detach after scrolling with a zero threshold.",
      );
    }
  },
);
