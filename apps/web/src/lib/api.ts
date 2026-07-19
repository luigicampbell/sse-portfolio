import type { PortfolioPageResponse } from "@domain/mod.ts";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getPortfolio(
  signal?: AbortSignal,
): Promise<PortfolioPageResponse> {
  const response = await fetch("/api/v1/portfolio", {
    headers: {
      accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      `Portfolio request failed with status ${response.status}.`,
      response.status,
    );
  }

  return await response.json() as PortfolioPageResponse;
}
