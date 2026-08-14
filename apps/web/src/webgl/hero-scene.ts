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
