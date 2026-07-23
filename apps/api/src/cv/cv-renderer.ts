import type { PortfolioPageResponse } from "@domain/mod.ts";

export interface CvRenderer {
  render(
    portfolio: PortfolioPageResponse,
  ): Promise<Uint8Array>;
}
