import type { Metadata } from "./metadata.ts";
import type { Profile } from "./profile.ts";
import type { SeedManifest } from "./seed-manifest.ts";

export function isIsoDateTime(
  value: string,
): boolean {
  const timestamp = Date.parse(value);

  return !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString() === value;
}

export function hasValidMetadata(
  value: unknown,
): value is Metadata {
  if (!isRecord(value)) {
    return false;
  }

  const {
    id,
    createdAt,
    updatedAt,
    tags,
  } = value;

  if (
    typeof id !== "string" ||
    id.length === 0
  ) {
    return false;
  }

  if (
    typeof createdAt !== "string" ||
    typeof updatedAt !== "string"
  ) {
    return false;
  }

  if (
    !isIsoDateTime(createdAt) ||
    !isIsoDateTime(updatedAt)
  ) {
    return false;
  }

  if (updatedAt < createdAt) {
    return false;
  }

  return isStringArray(tags);
}

export function hasValidProfile(
  value: unknown,
): value is Profile {
  if (
    !hasValidMetadata(value) ||
    !isRecord(value)
  ) {
    return false;
  }

  if (
    typeof value.name !== "string" ||
    value.name.length === 0
  ) {
    return false;
  }

  if (
    typeof value.eyebrow !== "string" ||
    typeof value.headline !== "string"
  ) {
    return false;
  }

  if (
    !Array.isArray(value.summary) ||
    !value.summary.every(
      hasValidRichTextRun,
    )
  ) {
    return false;
  }

  if (
    !Array.isArray(value.actions) ||
    !Array.isArray(value.metrics) ||
    !Array.isArray(value.socials)
  ) {
    return false;
  }

  if (
    value.location !== undefined &&
    typeof value.location !== "string"
  ) {
    return false;
  }

  if (
    value.email !== undefined &&
    typeof value.email !== "string"
  ) {
    return false;
  }

  return true;
}

export function hasValidSeedManifest(
  value: unknown,
): value is SeedManifest {
  if (!isRecord(value)) {
    return false;
  }

  return Number.isInteger(
    value.seedVersion,
  ) &&
    Number.isInteger(
      value.schemaVersion,
    ) &&
    typeof value.contentVersion ===
      "string" &&
    value.contentVersion.length > 0;
}

export function hasValidMetadataCollection(
  value: unknown,
): value is Metadata[] {
  return Array.isArray(value) &&
    value.every(
      hasValidMetadata,
    );
}

function hasValidRichTextRun(
  value: unknown,
): boolean {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.text !== "string"
  ) {
    return false;
  }

  if (
    value.emphasis !== undefined &&
    typeof value.emphasis !== "boolean"
  ) {
    return false;
  }

  if (
    value.link !== undefined &&
    typeof value.link !== "string"
  ) {
    return false;
  }

  return true;
}

function isStringArray(
  value: unknown,
): value is string[] {
  return Array.isArray(value) &&
    value.every(
      (item) => typeof item === "string",
    );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value);
}
