const MAX_PIXEL_RATIO = 2;

export interface HeroSceneCapabilities {
  supportsWebGL: boolean;
  prefersReducedMotion: boolean;
}

export function calculatePixelRatio(
  devicePixelRatio: number,
): number {
  return Math.min(
    Math.max(
      devicePixelRatio,
      1,
    ),
    MAX_PIXEL_RATIO,
  );
}

export function shouldRenderHeroScene({
  supportsWebGL,
  prefersReducedMotion,
}: HeroSceneCapabilities): boolean {
  return (
    supportsWebGL &&
    !prefersReducedMotion
  );
}

export function detectWebGLSupport(): boolean {
  if (
    typeof document ===
      "undefined"
  ) {
    return false;
  }

  const canvas = document.createElement(
    "canvas",
  );

  return Boolean(
    canvas.getContext(
      "webgl2",
    ) ??
      canvas.getContext(
        "webgl",
      ),
  );
}

export interface SceneViewport {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface NormalizedPointer {
  x: number;
  y: number;
}

export function normalizePointer(
  clientX: number,
  clientY: number,
  viewport: SceneViewport,
): NormalizedPointer {
  if (
    viewport.width <= 0 ||
    viewport.height <= 0
  ) {
    return {
      x: 0,
      y: 0,
    };
  }

  const x = (
        (
          clientX -
          viewport.left
        ) /
        viewport.width
      ) * 2 -
    1;

  const y = -(
        (
          clientY -
          viewport.top
        ) /
        viewport.height
      ) * 2 +
    1;

  return {
    x: clampNormalized(
      x,
    ),
    y: clampNormalized(
      y,
    ),
  };
}

function clampNormalized(
  value: number,
): number {
  return Math.min(
    1,
    Math.max(
      -1,
      value,
    ),
  );
}
