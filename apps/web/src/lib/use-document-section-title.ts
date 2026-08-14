import {
  useEffect,
} from "react";

const SITE_NAME =
  "Luigi Campbell";

const SECTION_TITLES = {
  home: "Home",
  projects: "Work",
  experience: "Career",
  skills: "Skills",
} as const;

type SectionId =
  keyof typeof SECTION_TITLES;

export function useDocumentSectionTitle(
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) {
      document.title =
        SITE_NAME;

      return;
    }

    const sections =
      Object.keys(
        SECTION_TITLES,
      )
        .map(
          (id) =>
            document.getElementById(
              id,
            ),
        )
        .filter(
          (
            element,
          ): element is HTMLElement =>
            element !== null,
        );

    if (
      sections.length === 0
    ) {
      document.title =
        `${SITE_NAME} | Home`;

      return;
    }

    const setTitle = (
      id: string,
    ) => {
      if (
        !(id in SECTION_TITLES)
      ) {
        return;
      }

      const sectionId =
        id as SectionId;

      document.title =
        `${SITE_NAME} | ${SECTION_TITLES[sectionId]}`;
    };

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting,
              )
              .sort(
                (
                  left,
                  right,
                ) =>
                  right
                    .intersectionRatio -
                  left
                    .intersectionRatio,
              )[0];

          if (!visible) {
            return;
          }

          setTitle(
            visible.target.id,
          );
        },
        {
          rootMargin:
            "-20% 0px -55% 0px",

          threshold: [
            0,
            0.25,
            0.5,
            0.75,
            1,
          ],
        },
      );

    for (
      const section of sections
    ) {
      observer.observe(
        section,
      );
    }

    const handleHashChange =
      () => {
        const id =
          globalThis.location.hash
            .replace(
              /^#/,
              "",
            );

        if (id) {
          setTitle(
            id,
          );
        }
      };

    globalThis.addEventListener(
      "hashchange",
      handleHashChange,
    );

    handleHashChange();

    return () => {
      observer.disconnect();

      globalThis
        .removeEventListener(
          "hashchange",
          handleHashChange,
        );
    };
  }, [
    enabled,
  ]);
}
