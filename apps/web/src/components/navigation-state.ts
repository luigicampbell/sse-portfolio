export function shouldDetachNavigation(
  scrollY: number,
  threshold: number,
): boolean {
  return Math.max(0, scrollY) > Math.max(0, threshold);
}
