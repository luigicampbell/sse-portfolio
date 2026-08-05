import type { Router } from "@oak/oak/router";

import type { PortfolioPageResponse } from "@domain/mod.ts";

import { env } from "../../config/env.ts";

import type { PortfolioService } from "../../services/portfolio.service.ts";

interface TimestampedContent {
  updatedAt: string;
}

export function registerSitemapRoutes(
  router: Router,
  service: PortfolioService,
): void {
  router.get(
    "/sitemap.xml",
    async (context) => {
      const portfolio = await service.getPortfolioPage();

      const lastModified = getPortfolioLastModified(
        portfolio,
      );

      context.response.type = "application/xml";

      context.response.headers.set(
        "cache-control",
        "public, max-age=3600, stale-while-revalidate=86400",
      );

      context.response.body = createSitemapXml(
        env.siteUrl,
        lastModified,
      );
    },
  );
}

function getPortfolioLastModified(
  portfolio: PortfolioPageResponse,
): string {
  const content: TimestampedContent[] = [
    portfolio.hero.profile,
    ...portfolio.projects.all,
    ...portfolio.skills.items,
    ...portfolio.experience.items,
    ...portfolio.education.items,
    ...portfolio.credentials.items,
    ...portfolio.volunteer.items,
  ];

  const timestamps = content
    .map((item) => Date.parse(item.updatedAt))
    .filter(Number.isFinite);

  if (timestamps.length === 0) {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }

  return new Date(
    Math.max(...timestamps),
  )
    .toISOString()
    .slice(0, 10);
}

function createSitemapXml(
  siteUrl: string,
  lastModified: string,
): string {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    `    <loc>${escapeXml(`${normalizedSiteUrl}/`)}</loc>`,
    `    <lastmod>${escapeXml(lastModified)}</lastmod>`,
    "    <changefreq>weekly</changefreq>",
    "    <priority>1.0</priority>",
    "  </url>",
    "</urlset>",
    "",
  ].join("\n");
}

function escapeXml(
  value: string,
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
