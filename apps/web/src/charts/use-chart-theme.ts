import { useEffect, useState } from "react";

import { type ChartTheme, getChartTheme } from "./chart-theme.ts";

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(() => getChartTheme());

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const updateTheme = () => {
      setTheme(getChartTheme());
    };

    mediaQuery.addEventListener("change", updateTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, []);

  return theme;
}
