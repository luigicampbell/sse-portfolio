export interface ChartTheme {
  readonly text: string;
  readonly grid: string;
  readonly surface: string;
  readonly primary: string;
  readonly primaryFill: string;
  readonly categoryColors: readonly string[];
}

const FALLBACK_CHART_THEME: ChartTheme = {
  text: "#111827",
  grid: "#d1d5db",
  surface: "#ffffff",
  primary: "#2563eb",
  primaryFill: "rgba(37, 99, 235, 0.15)",
  categoryColors: [
    "#2563eb",
    "#22c55e",
    "#8b5cf6",
    "#f97316",
    "#ec4899",
    "#14b8a6",
  ],
};

export function getChartTheme(): ChartTheme {
  if (typeof document === "undefined") {
    return FALLBACK_CHART_THEME;
  }

  const styles = getComputedStyle(document.documentElement);

  const readCssVariable = (
    name: string,
    fallback: string,
  ): string => {
    return styles.getPropertyValue(name).trim() || fallback;
  };

  const primary = readCssVariable(
    "--color-chart-primary",
    FALLBACK_CHART_THEME.primary,
  );

  return {
    text: readCssVariable(
      "--color-chart-text",
      FALLBACK_CHART_THEME.text,
    ),

    grid: readCssVariable(
      "--color-chart-grid",
      FALLBACK_CHART_THEME.grid,
    ),

    surface: readCssVariable(
      "--color-chart-surface",
      FALLBACK_CHART_THEME.surface,
    ),

    primary,

    primaryFill: readCssVariable(
      "--color-chart-primary-fill",
      FALLBACK_CHART_THEME.primaryFill,
    ),

    categoryColors: [
      primary,
      readCssVariable(
        "--color-chart-green",
        FALLBACK_CHART_THEME.categoryColors[1],
      ),
      readCssVariable(
        "--color-chart-purple",
        FALLBACK_CHART_THEME.categoryColors[2],
      ),
      readCssVariable(
        "--color-chart-orange",
        FALLBACK_CHART_THEME.categoryColors[3],
      ),
      readCssVariable(
        "--color-chart-pink",
        FALLBACK_CHART_THEME.categoryColors[4],
      ),
      readCssVariable(
        "--color-chart-teal",
        FALLBACK_CHART_THEME.categoryColors[5],
      ),
    ],
  };
}
