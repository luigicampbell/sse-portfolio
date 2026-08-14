import {
  useEffect,
  useState,
} from "react";

import {
  type ChartTheme,
  getChartTheme,
} from "./chart-theme.ts";

export function useChartTheme():
  ChartTheme {
  const [
    theme,
    setTheme,
  ] =
    useState<ChartTheme>(
      () =>
        getChartTheme(),
    );

  useEffect(() => {
    const mediaQuery =
      globalThis.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    const updateTheme =
      () => {
        setTheme(
          getChartTheme(),
        );
      };

    const observer =
      new MutationObserver(
        (
          mutations,
        ) => {
          const changed =
            mutations.some(
              (
                mutation,
              ) =>
                mutation.type ===
                  "attributes" &&
                mutation.attributeName ===
                  "data-theme",
            );

          if (changed) {
            updateTheme();
          }
        },
      );

    observer.observe(
      document.documentElement,
      {
        attributes:
          true,

        attributeFilter: [
          "data-theme",
        ],
      },
    );

    mediaQuery
      .addEventListener(
        "change",
        updateTheme,
      );

    updateTheme();

    return () => {
      observer.disconnect();

      mediaQuery
        .removeEventListener(
          "change",
          updateTheme,
        );
    };
  }, []);

  return theme;
}
