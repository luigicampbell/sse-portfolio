import type { CvDocument } from "../cv/cv-document.ts";
import type { CvRenderer } from "../cv/cv-renderer.ts";
import type { PortfolioService } from "./portfolio.service.ts";

export class CvService {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly renderer: CvRenderer,
  ) {}

  async generate(): Promise<CvDocument> {
    const portfolio = await this.portfolioService.getPortfolioPage();
    const bytes = await this.renderer.render(portfolio);

    return {
      bytes,
      contentType: "application/pdf",
      fileName: createCvFileName(portfolio.hero.profile.name),
    };
  }
}

function createCvFileName(name: string): string {
  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalizedName || "portfolio"}-cv.pdf`;
}
