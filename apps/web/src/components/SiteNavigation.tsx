import { useEffect, useState } from "react";

import { shouldDetachNavigation } from "./navigation-state.ts";

import "./SiteNavigation.css";

const NAVIGATION_DETACH_THRESHOLD_PX = 24;

const NAVIGATION_ITEMS = [
  {
    href: "#projects",
    label: "Projects",
    compactLabel: "Work",
    ariaLabel: "Go to projects",
  },
  {
    href: "#experience",
    label: "Experience",
    compactLabel: "Career",
    ariaLabel: "Go to experience",
  },
  {
    href: "#skills",
    label: "Skills",
    compactLabel: "Skills",
    ariaLabel: "Go to skills",
  },
] as const;

export function SiteNavigation() {
  const [
    isDetached,
    setIsDetached,
  ] = useState(false);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateDetachedState = () => {
      animationFrameId = null;

      setIsDetached(
        shouldDetachNavigation(
          globalThis.scrollY,
          NAVIGATION_DETACH_THRESHOLD_PX,
        ),
      );
    };

    const handleScroll = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = globalThis.requestAnimationFrame(
        updateDetachedState,
      );
    };

    updateDetachedState();

    globalThis.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      globalThis.removeEventListener(
        "scroll",
        handleScroll,
      );

      if (animationFrameId !== null) {
        globalThis.cancelAnimationFrame(
          animationFrameId,
        );
      }
    };
  }, []);

  return (
    <nav
      className="site-navigation"
      aria-label="Primary navigation"
      data-detached={isDetached ? "true" : "false"}
    >
      <a
        className="site-navigation__brand"
        href="#home"
        aria-label="Go to home"
      >
        <span
          className="site-navigation__brand-mark"
          aria-hidden="true"
        >
          LC
        </span>

        <span
          className="site-navigation__brand-label"
          aria-hidden="true"
        >
          Home
        </span>
      </a>

      <div className="site-navigation__links">
        {NAVIGATION_ITEMS.map(
          ({
            href,
            label,
            compactLabel,
            ariaLabel,
          }) => (
            <a
              key={href}
              className="site-navigation__link"
              href={href}
              aria-label={ariaLabel}
            >
              <span
                className="site-navigation__label site-navigation__label--full"
                aria-hidden="true"
              >
                {label}
              </span>

              <span
                className="site-navigation__label site-navigation__label--compact"
                aria-hidden="true"
              >
                {compactLabel}
              </span>
            </a>
          ),
        )}
      </div>
    </nav>
  );
}
