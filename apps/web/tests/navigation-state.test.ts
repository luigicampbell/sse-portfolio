import {
  getActiveNavigationSection,
  shouldDetachNavigation,
} from "../src/components/navigation-state.ts";

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

Deno.test(
  "active navigation section is the section containing the activation line",
  () => {
    const active = getActiveNavigationSection(
      [
        {
          id: "home",
          top: -200,
          bottom: 120,
        },
        {
          id: "projects",
          top: 120,
          bottom: 720,
        },
        {
          id: "experience",
          top: 720,
          bottom: 1320,
        },
        {
          id: "skills",
          top: 1320,
          bottom: 1920,
        },
      ],
      240,
    );

    assertActiveSection(
      active,
      "projects",
    );
  },
);

Deno.test(
  "active navigation section changes when the next section crosses the activation line",
  () => {
    const active = getActiveNavigationSection(
      [
        {
          id: "home",
          top: -900,
          bottom: -100,
        },
        {
          id: "projects",
          top: -100,
          bottom: 200,
        },
        {
          id: "experience",
          top: 200,
          bottom: 900,
        },
        {
          id: "skills",
          top: 900,
          bottom: 1500,
        },
      ],
      240,
    );

    assertActiveSection(
      active,
      "experience",
    );
  },
);

Deno.test(
  "active navigation section remains on the preceding section through layout gaps",
  () => {
    const active = getActiveNavigationSection(
      [
        {
          id: "home",
          top: -800,
          bottom: -100,
        },
        {
          id: "projects",
          top: -100,
          bottom: 180,
        },
        {
          id: "experience",
          top: 320,
          bottom: 900,
        },
        {
          id: "skills",
          top: 900,
          bottom: 1500,
        },
      ],
      240,
    );

    assertActiveSection(
      active,
      "projects",
    );
  },
);

Deno.test(
  "active navigation section defaults to the first section before content reaches the activation line",
  () => {
    const active = getActiveNavigationSection(
      [
        {
          id: "home",
          top: 80,
          bottom: 700,
        },
        {
          id: "projects",
          top: 700,
          bottom: 1300,
        },
      ],
      40,
    );

    assertActiveSection(
      active,
      "home",
    );
  },
);

Deno.test(
  "active navigation section remains on the final section after its bounds pass the activation line",
  () => {
    const active = getActiveNavigationSection(
      [
        {
          id: "home",
          top: -2400,
          bottom: -1800,
        },
        {
          id: "projects",
          top: -1800,
          bottom: -1200,
        },
        {
          id: "experience",
          top: -1200,
          bottom: -600,
        },
        {
          id: "skills",
          top: -600,
          bottom: -40,
        },
      ],
      240,
    );

    assertActiveSection(
      active,
      "skills",
    );
  },
);

Deno.test(
  "active navigation section clamps a negative activation offset",
  () => {
    const active = getActiveNavigationSection(
      [
        {
          id: "home",
          top: -100,
          bottom: 100,
        },
        {
          id: "projects",
          top: 100,
          bottom: 700,
        },
      ],
      -20,
    );

    assertActiveSection(
      active,
      "home",
    );
  },
);

Deno.test(
  "active navigation section returns null when no sections are available",
  () => {
    const active = getActiveNavigationSection(
      [],
      240,
    );

    if (active !== null) {
      throw new Error(
        `Expected no active section, received "${active}".`,
      );
    }
  },
);

function assertActiveSection(
  actual: string | null,
  expected: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `Expected active section "${expected}", received "${actual}".`,
    );
  }
}
