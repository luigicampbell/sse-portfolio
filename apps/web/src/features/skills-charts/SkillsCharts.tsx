import { lazy, Suspense, useEffect, useRef, useState } from "react";

import type { Skill } from "@domain/mod.ts";

import "./SkillsCharts.css";

const CHART_PRELOAD_ROOT_MARGIN = "600px 0px";

const SkillsDoughnut = lazy(
  async () => {
    const module = await import(
      "./SkillsDoughnut.tsx"
    );

    return {
      default: module.SkillsDoughnut,
    };
  },
);

const SkillsRadar = lazy(
  async () => {
    const module = await import(
      "./SkillsRadar.tsx"
    );

    return {
      default: module.SkillsRadar,
    };
  },
);

interface SkillsChartsProps {
  skills: Skill[];
}

export default function SkillsCharts({
  skills,
}: SkillsChartsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [
    shouldRenderCharts,
    setShouldRenderCharts,
  ] = useState(false);

  useEffect(() => {
    if (shouldRenderCharts) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (
      !(
        "IntersectionObserver" in
          globalThis
      )
    ) {
      setShouldRenderCharts(true);

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const shouldLoad = entries.some(
          (entry) => entry.isIntersecting,
        );

        if (!shouldLoad) {
          return;
        }

        setShouldRenderCharts(
          true,
        );

        observer.disconnect();
      },
      {
        rootMargin: CHART_PRELOAD_ROOT_MARGIN,
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [shouldRenderCharts]);

  return (
    <div
      ref={containerRef}
      className="charts-grid"
    >
      {shouldRenderCharts
        ? (
          <Suspense
            fallback={<ChartPlaceholders />}
          >
            <SkillsDoughnut
              skills={skills}
            />

            <SkillsRadar
              skills={skills}
            />
          </Suspense>
        )
        : <ChartPlaceholders />}
    </div>
  );
}

function ChartPlaceholders() {
  return (
    <>
      <div
        className="chart-panel"
        aria-hidden="true"
      >
        <div className="chart-heading">
          <p className="eyebrow">
            Distribution
          </p>

          <h3>
            Capability areas
          </h3>

          <p>
            Skill coverage grouped by engineering discipline.
          </p>
        </div>

        <div className="chart-container chart-container-doughnut" />
      </div>

      <div
        className="chart-panel"
        aria-hidden="true"
      >
        <div className="chart-heading">
          <p className="eyebrow">
            Breadth
          </p>

          <h3>
            Technical profile
          </h3>

          <p>
            Relative breadth across the skill categories represented in this
            portfolio.
          </p>
        </div>

        <div className="chart-container chart-container-radar" />
      </div>
    </>
  );
}
