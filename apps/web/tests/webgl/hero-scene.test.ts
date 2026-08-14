import {
  calculatePixelRatio,
  normalizePointer,
  shouldRenderHeroScene,
} from "../../src/webgl/hero-scene.ts";

Deno.test(
  "calculatePixelRatio caps high-density displays",
  () => {
    const actual = calculatePixelRatio(3);

    if (actual !== 2) {
      throw new Error(
        `Expected DPR 2, received ${actual}.`,
      );
    }
  },
);

Deno.test(
  "calculatePixelRatio preserves lower-density displays",
  () => {
    const actual = calculatePixelRatio(1.5);

    if (actual !== 1.5) {
      throw new Error(
        `Expected DPR 1.5, received ${actual}.`,
      );
    }
  },
);

Deno.test(
  "hero scene is disabled when reduced motion is requested",
  () => {
    const actual = shouldRenderHeroScene({
      supportsWebGL: true,
      prefersReducedMotion: true,
    });

    if (actual) {
      throw new Error(
        "Expected hero scene to be disabled.",
      );
    }
  },
);

Deno.test(
  "hero scene is disabled without WebGL support",
  () => {
    const actual = shouldRenderHeroScene({
      supportsWebGL: false,
      prefersReducedMotion: false,
    });

    if (actual) {
      throw new Error(
        "Expected hero scene to be disabled.",
      );
    }
  },
);

Deno.test(
  "hero scene is enabled when WebGL is supported and motion is allowed",
  () => {
    const actual = shouldRenderHeroScene({
      supportsWebGL: true,
      prefersReducedMotion: false,
    });

    if (!actual) {
      throw new Error(
        "Expected hero scene to be enabled.",
      );
    }
  },
);

Deno.test(
  "normalizePointer maps the center of a viewport to the origin",
  () => {
    const actual = normalizePointer(
      150,
      100,
      {
        left: 50,
        top: 50,
        width: 200,
        height: 100,
      },
    );

    if (
      actual.x !== 0 ||
      actual.y !== 0
    ) {
      throw new Error(
        `Expected { x: 0, y: 0 }, received ${JSON.stringify(actual)}.`,
      );
    }
  },
);

Deno.test(
  "normalizePointer clamps values to normalized device coordinates",
  () => {
    const actual = normalizePointer(
      500,
      -100,
      {
        left: 0,
        top: 0,
        width: 200,
        height: 100,
      },
    );

    if (
      actual.x !== 1 ||
      actual.y !== 1
    ) {
      throw new Error(
        `Expected { x: 1, y: 1 }, received ${JSON.stringify(actual)}.`,
      );
    }
  },
);
