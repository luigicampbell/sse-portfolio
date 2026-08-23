import { useEffect, useState } from "react";

import {
  createPortfolioSectionHref,
  isPortfolioPath,
} from "../lib/portfolio-navigation.ts";

import {
  getActiveNavigationSection,
  type NavigationSectionBounds,
  shouldDetachNavigation,
} from "./navigation-state.ts";

import "./SiteNavigation.css";

const BASE_URL = import.meta.env.BASE_URL;

const NAVIGATION_DETACH_THRESHOLD_PX = 24;

const NAVIGATION_ACTIVATION_VIEWPORT_RATIO = 0.3;

const NAVIGATION_ACTIVATION_MAX_PX = 240;

const HOME_NAVIGATION_ITEM = {
  id: "home",
  ariaLabel: "Go to home",
} as const;

const NAVIGATION_ITEMS = [
  {
    id: "projects",
    label: "Projects",
    compactLabel: "Work",
    ariaLabel: "Go to projects",
  },
  {
    id: "experience",
    label: "Experience",
    compactLabel: "Career",
    ariaLabel: "Go to experience",
  },
  {
    id: "skills",
    label: "Skills",
    compactLabel: "Skills",
    ariaLabel: "Go to skills",
  },
] as const;

const NAVIGATION_SECTION_IDS = [
  HOME_NAVIGATION_ITEM.id,
  ...NAVIGATION_ITEMS.map(
    (item) => item.id,
  ),
] as const;

const BRAND_IMAGE_BASE_URL = `${BASE_URL}images/brand`;

export function SiteNavigation() {
  const [
    isDetached,
    setIsDetached,
  ] = useState(false);

  const [
    activeSectionId,
    setActiveSectionId,
  ] = useState<string | null>(
    null,
  );

  const isOnPortfolio = isPortfolioPath(
    globalThis.location.pathname,
    BASE_URL,
  );

  useEffect(() => {
    if (!isOnPortfolio) {
      setIsDetached(false);
      setActiveSectionId(null);

      return;
    }

    let animationFrameId: number | null = null;

    const updateNavigationState = (): void => {
      animationFrameId = null;

      setIsDetached(
        shouldDetachNavigation(
          globalThis.scrollY,
          NAVIGATION_DETACH_THRESHOLD_PX,
        ),
      );

      const sections = getNavigationSectionBounds();

      const activeSection = getActiveNavigationSection(
        sections,
        getNavigationActivationOffset(),
      );

      setActiveSectionId(
        activeSection,
      );
    };

    const scheduleUpdate = (): void => {
      if (
        animationFrameId !== null
      ) {
        return;
      }

      animationFrameId = globalThis
        .requestAnimationFrame(
          updateNavigationState,
        );
    };

    updateNavigationState();

    globalThis.addEventListener(
      "scroll",
      scheduleUpdate,
      {
        passive: true,
      },
    );

    globalThis.addEventListener(
      "resize",
      scheduleUpdate,
    );

    return () => {
      globalThis.removeEventListener(
        "scroll",
        scheduleUpdate,
      );

      globalThis.removeEventListener(
        "resize",
        scheduleUpdate,
      );

      if (
        animationFrameId !== null
      ) {
        globalThis
          .cancelAnimationFrame(
            animationFrameId,
          );
      }
    };
  }, [isOnPortfolio]);

  return (
    <nav
      className="site-navigation"
      aria-label="Primary navigation"
      data-detached={isDetached ? "true" : "false"}
    >
      <a
        className="site-navigation__brand"
        href={createPortfolioSectionHref(
          BASE_URL,
          HOME_NAVIGATION_ITEM.id,
        )}
        aria-label={HOME_NAVIGATION_ITEM
          .ariaLabel}
        aria-current={isOnPortfolio &&
            activeSectionId ===
              HOME_NAVIGATION_ITEM.id
          ? "location"
          : undefined}
      >
        <picture
          className="site-navigation__brand-mark"
          aria-hidden="true"
        >
          <source
            type="image/webp"
            srcSet={[
              `${BRAND_IMAGE_BASE_URL}/brand-mark-48.webp 48w`,
              `${BRAND_IMAGE_BASE_URL}/brand-mark-96.webp 96w`,
              `${BRAND_IMAGE_BASE_URL}/brand-mark-192.webp 192w`,
            ].join(", ")}
            sizes="40px"
          />

          <img
            className="site-navigation__brand-image"
            src={`${BRAND_IMAGE_BASE_URL}/brand-mark-48.png`}
            srcSet={[
              `${BRAND_IMAGE_BASE_URL}/brand-mark-48.png 48w`,
              `${BRAND_IMAGE_BASE_URL}/brand-mark-96.png 96w`,
              `${BRAND_IMAGE_BASE_URL}/brand-mark-192.png 192w`,
            ].join(", ")}
            sizes="40px"
            width="40"
            height="40"
            alt=""
            decoding="async"
          />
        </picture>

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
            id,
            label,
            compactLabel,
            ariaLabel,
          }) => (
            <a
              key={id}
              className="site-navigation__link"
              href={createPortfolioSectionHref(
                BASE_URL,
                id,
              )}
              aria-label={ariaLabel}
              aria-current={isOnPortfolio &&
                  activeSectionId ===
                    id
                ? "location"
                : undefined}
            >
              <span className="site-navigation__label">
                {label}
              </span>

              <span className="site-navigation__compact-label">
                {compactLabel}
              </span>
            </a>
          ),
        )}
      </div>
    </nav>
  );
}

function getNavigationSectionBounds(): NavigationSectionBounds[] {
  const sections: NavigationSectionBounds[] = [];

  for (
    const id of NAVIGATION_SECTION_IDS
  ) {
    const element = globalThis.document
      .getElementById(id);

    if (!element) {
      continue;
    }

    const bounds = element
      .getBoundingClientRect();

    sections.push({
      id,
      top: bounds.top,
      bottom: bounds.bottom,
    });
  }

  return sections;
}

function getNavigationActivationOffset(): number {
  return Math.min(
    globalThis.innerHeight *
      NAVIGATION_ACTIVATION_VIEWPORT_RATIO,
    NAVIGATION_ACTIVATION_MAX_PX,
  );
}
