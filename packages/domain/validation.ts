import type { Metadata } from "./metadata.ts";
import type { Profile } from "./profile.ts";
import type { SeedManifest } from "./seed-manifest.ts";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "ValidationError";
  }
}

export function isIsoDateTime(
  value: string,
): boolean {
  const timestamp = Date.parse(value);

  return !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString() === value;
}

export function assertValidMetadata(
  value: unknown,
  path = "metadata",
): asserts value is Metadata {
  if (!isRecord(value)) {
    throw new ValidationError(
      `${path} must be an object.`,
    );
  }

  const {
    id,
    createdAt,
    updatedAt,
    published,
    featured,
    tags,
  } = value;

  if (
    typeof id !== "string" ||
    id.length === 0
  ) {
    throw new ValidationError(
      `${path}.id must be a non-empty string.`,
    );
  }

  if (
    typeof createdAt !== "string"
  ) {
    throw new ValidationError(
      `${path}.createdAt must be a string.`,
    );
  }

  if (
    !isIsoDateTime(createdAt)
  ) {
    throw new ValidationError(
      `${path}.createdAt is not a valid ISO datetime: ${createdAt}`,
    );
  }

  if (
    typeof updatedAt !== "string"
  ) {
    throw new ValidationError(
      `${path}.updatedAt must be a string.`,
    );
  }

  if (
    !isIsoDateTime(updatedAt)
  ) {
    throw new ValidationError(
      `${path}.updatedAt is not a valid ISO datetime: ${updatedAt}`,
    );
  }

  if (
    updatedAt < createdAt
  ) {
    throw new ValidationError(
      `${path}.updatedAt cannot be earlier than createdAt.`,
    );
  }

  if (
    typeof published !==
      "boolean"
  ) {
    throw new ValidationError(
      `${path}.published must be a boolean.`,
    );
  }

  if (
    typeof featured !==
      "boolean"
  ) {
    throw new ValidationError(
      `${path}.featured must be a boolean.`,
    );
  }

  if (
    tags !== undefined &&
    !isStringArray(tags)
  ) {
    throw new ValidationError(
      `${path}.tags must be an array of strings when provided.`,
    );
  }
}

export function hasValidMetadata(
  value: unknown,
): value is Metadata {
  try {
    assertValidMetadata(
      value,
    );

    return true;
  } catch {
    return false;
  }
}

export function assertValidProfile(
  value: unknown,
  path = "profile",
): asserts value is Profile {
  assertValidMetadata(
    value,
    path,
  );

  if (!isRecord(value)) {
    throw new ValidationError(
      `${path} must be an object.`,
    );
  }

  if (
    typeof value.name !== "string" ||
    value.name.length === 0
  ) {
    throw new ValidationError(
      `${path}.name must be a non-empty string.`,
    );
  }

  if (
    typeof value.eyebrow !== "string"
  ) {
    throw new ValidationError(
      `${path}.eyebrow must be a string.`,
    );
  }

  if (
    typeof value.headline !== "string"
  ) {
    throw new ValidationError(
      `${path}.headline must be a string.`,
    );
  }

  if (
    !Array.isArray(
      value.summary,
    )
  ) {
    throw new ValidationError(
      `${path}.summary must be an array.`,
    );
  }

  value.summary.forEach(
    (run, index) => {
      assertValidRichTextRun(
        run,
        `${path}.summary[${index}]`,
      );
    },
  );

  if (
    !Array.isArray(
      value.actions,
    )
  ) {
    throw new ValidationError(
      `${path}.actions must be an array.`,
    );
  }

  if (
    !Array.isArray(
      value.metrics,
    )
  ) {
    throw new ValidationError(
      `${path}.metrics must be an array.`,
    );
  }

  if (
    !Array.isArray(
      value.socials,
    )
  ) {
    throw new ValidationError(
      `${path}.socials must be an array.`,
    );
  }

  if (
    value.location !== undefined &&
    typeof value.location !== "string"
  ) {
    throw new ValidationError(
      `${path}.location must be a string when provided.`,
    );
  }

  if (
    value.email !== undefined &&
    typeof value.email !== "string"
  ) {
    throw new ValidationError(
      `${path}.email must be a string when provided.`,
    );
  }
}

export function hasValidProfile(
  value: unknown,
): value is Profile {
  try {
    assertValidProfile(
      value,
    );

    return true;
  } catch {
    return false;
  }
}

export function assertValidSeedManifest(
  value: unknown,
  path = "manifest",
): asserts value is SeedManifest {
  if (!isRecord(value)) {
    throw new ValidationError(
      `${path} must be an object.`,
    );
  }

  if (
    !Number.isInteger(
      value.seedVersion,
    )
  ) {
    throw new ValidationError(
      `${path}.seedVersion must be an integer.`,
    );
  }

  if (
    !Number.isInteger(
      value.schemaVersion,
    )
  ) {
    throw new ValidationError(
      `${path}.schemaVersion must be an integer.`,
    );
  }

  if (
    typeof value.contentVersion !==
      "string" ||
    value.contentVersion.length === 0
  ) {
    throw new ValidationError(
      `${path}.contentVersion must be a non-empty string.`,
    );
  }
}

export function hasValidSeedManifest(
  value: unknown,
): value is SeedManifest {
  try {
    assertValidSeedManifest(
      value,
    );

    return true;
  } catch {
    return false;
  }
}

export function assertValidMetadataCollection(
  value: unknown,
  name: string,
): asserts value is Metadata[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `${name} must be an array.`,
    );
  }

  value.forEach(
    (item, index) => {
      assertValidMetadata(
        item,
        `${name}[${index}]`,
      );
    },
  );
}

export function hasValidMetadataCollection(
  value: unknown,
): value is Metadata[] {
  try {
    assertValidMetadataCollection(
      value,
      "collection",
    );

    return true;
  } catch {
    return false;
  }
}

function assertValidRichTextRun(
  value: unknown,
  path: string,
): void {
  if (!isRecord(value)) {
    throw new ValidationError(
      `${path} must be an object.`,
    );
  }

  if (
    typeof value.text !==
      "string"
  ) {
    throw new ValidationError(
      `${path}.text must be a string.`,
    );
  }

  if (
    value.emphasis !== undefined &&
    typeof value.emphasis !== "boolean"
  ) {
    throw new ValidationError(
      `${path}.emphasis must be a boolean when provided.`,
    );
  }

  if (
    value.link !== undefined &&
    typeof value.link !== "string"
  ) {
    throw new ValidationError(
      `${path}.link must be a string when provided.`,
    );
  }
}

function isStringArray(
  value: unknown,
): value is string[] {
  return Array.isArray(
    value,
  ) &&
    value.every(
      (item) => typeof item === "string",
    );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value,
    );
}
