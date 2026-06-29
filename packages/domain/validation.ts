import type { Metadata } from "./metadata.ts";

export function isIsoDateTime(value: string): boolean {
  const timestamp = Date.parse(value);

  return !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString() === value;
}

export function hasValidMetadata(
  value: Metadata,
): boolean {
  return value.id.length > 0 &&
    isIsoDateTime(value.createdAt) &&
    isIsoDateTime(value.updatedAt) &&
    value.updatedAt >= value.createdAt &&
    Array.isArray(value.tags);
}
