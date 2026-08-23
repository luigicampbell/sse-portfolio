export function normalizeBasePath(
  baseUrl: string,
): string {
  const trimmedBaseUrl = baseUrl.trim();

  if (
    trimmedBaseUrl.length === 0 ||
    trimmedBaseUrl === "/"
  ) {
    return "/";
  }

  const withLeadingSlash = trimmedBaseUrl.startsWith("/")
    ? trimmedBaseUrl
    : `/${trimmedBaseUrl}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export function createPortfolioSectionHref(
  baseUrl: string,
  sectionId: string,
): string {
  return `${normalizeBasePath(baseUrl)}#${sectionId}`;
}

export function isPortfolioPath(
  pathname: string,
  baseUrl: string,
): boolean {
  const normalizedBasePath = normalizeBasePath(baseUrl);

  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return normalizedPathname ===
    normalizedBasePath;
}
