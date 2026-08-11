export const SUPPORTED_SEED_SCHEMA_VERSION = 0;

export interface SeedManifest {
  seedVersion: number;
  schemaVersion: number;
  contentVersion: string;
}

export function hasSupportedSeedSchemaVersion(
  manifest: SeedManifest,
): boolean {
  return (
    manifest.schemaVersion ===
      SUPPORTED_SEED_SCHEMA_VERSION
  );
}
