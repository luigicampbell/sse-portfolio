export type StorageDriver = "kv" | "postgres";

function parsePort(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) return fallback;

  const port = Number(value);

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535
  ) {
    throw new Error(
      `Invalid port value: ${value}`,
    );
  }

  return port;
}

function parseStorageDriver(
  value: string | undefined,
): StorageDriver {
  const driver = value ?? "kv";

  if (
    driver !== "kv" &&
    driver !== "postgres"
  ) {
    throw new Error(
      `Unsupported STORAGE_DRIVER: ${driver}`,
    );
  }

  return driver;
}

function parseSiteUrl(
  value: string | undefined,
): string {
  const siteUrl = value ?? "http://localhost:5173";

  let url: URL;

  try {
    url = new URL(siteUrl);
  } catch {
    throw new Error(
      `Invalid SITE_URL: ${siteUrl}`,
    );
  }

  return url.toString().replace(/\/$/, "");
}

export const env = {
  apiPort: parsePort(
    Deno.env.get("API_PORT"),
    3001,
  ),
  storageDriver: parseStorageDriver(
    Deno.env.get("STORAGE_DRIVER"),
  ),
  kvPath: Deno.env.get("DENO_KV_PATH") ??
    "./data/portfolio.local.kv",
  siteUrl: parseSiteUrl(
    Deno.env.get("SITE_URL"),
  ),
} as const;
