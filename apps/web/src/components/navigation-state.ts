export interface NavigationSectionBounds {
  id: string;
  top: number;
  bottom: number;
}

export function shouldDetachNavigation(
  scrollY: number,
  threshold: number,
): boolean {
  return Math.max(0, scrollY) >
    Math.max(0, threshold);
}

export function getActiveNavigationSection(
  sections: readonly NavigationSectionBounds[],
  activationOffset: number,
): string | null {
  if (sections.length === 0) {
    return null;
  }

  const activationLine = Math.max(
    0,
    activationOffset,
  );

  let activeSectionId = sections[0].id;

  for (const section of sections) {
    if (section.top > activationLine) {
      break;
    }

    activeSectionId = section.id;
  }

  return activeSectionId;
}
