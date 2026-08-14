import {
  calculatePixelRatio,
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
