import type { SeedPayload } from "@domain/mod.ts";

export interface SeedPushOptions {
  baseUrl: string;
  token: string;
  payload: SeedPayload;
}

export async function pushSeed(
  options: SeedPushOptions,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const baseUrl = options.baseUrl.replace(
    /\/+$/,
    "",
  );

  const response = await fetcher(
    `${baseUrl}/internal/seed`,
    {
      method: "POST",

      headers: {
        authorization: `Bearer ${options.token}`,

        "content-type": "application/json",
      },

      body: JSON.stringify(
        options.payload,
      ),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Seed request failed with status ${response.status}.`,
    );
  }
}
