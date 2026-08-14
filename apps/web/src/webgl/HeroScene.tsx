import { useEffect, useRef, useState } from "react";

import { createHeroScene } from "./create-hero-scene.ts";

import { detectWebGLSupport, shouldRenderHeroScene } from "./hero-scene.ts";

import "./HeroScene.css";

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(
    null,
  );

  const canvasRef = useRef<HTMLCanvasElement>(
    null,
  );

  const [
    enabled,
    setEnabled,
  ] = useState(
    false,
  );

  useEffect(() => {
    const motionQuery = globalThis
      .matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const updateEnabled = () => {
      setEnabled(
        shouldRenderHeroScene({
          supportsWebGL: detectWebGLSupport(),

          prefersReducedMotion: motionQuery.matches,
        }),
      );
    };

    updateEnabled();

    motionQuery
      .addEventListener(
        "change",
        updateEnabled,
      );

    return () => {
      motionQuery
        .removeEventListener(
          "change",
          updateEnabled,
        );
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const container = containerRef.current;

    const canvas = canvasRef.current;

    if (
      !container ||
      !canvas
    ) {
      return;
    }

    const rootStyles = getComputedStyle(
      document.documentElement,
    );

    const primary = rootStyles
      .getPropertyValue(
        "--color-accent",
      )
      .trim();

    const secondary = rootStyles
      .getPropertyValue(
        "--color-border-strong",
      )
      .trim();

    const scene = createHeroScene(
      canvas,
      container,
      {
        primary,
        secondary,
      },
    );

    const resizeObserver = new ResizeObserver(
      () => {
        scene.resize();
      },
    );

    resizeObserver.observe(
      container,
    );

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      scene.setPointer(
        event.clientX,
        event.clientY,
      );
    };

    globalThis
      .addEventListener(
        "pointermove",
        handlePointerMove,
        {
          passive: true,
        },
      );

    return () => {
      globalThis
        .removeEventListener(
          "pointermove",
          handlePointerMove,
        );

      resizeObserver.disconnect();

      scene.dispose();
    };
  }, [
    enabled,
  ]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="hero-scene"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="hero-scene__canvas"
      />
    </div>
  );
}
