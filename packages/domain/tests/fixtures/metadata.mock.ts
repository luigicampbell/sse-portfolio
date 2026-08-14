import { assertValidMetadata, ValidationError } from "../../validation.ts";

import type { Metadata } from "../../metadata.ts";

export const VALID_METADATA: Metadata = {
  id: "test-item",
  createdAt: "2026-07-24T00:00:00.000Z",
  updatedAt: "2026-07-24T00:00:00.000Z",
  published: true,
  featured: false,
};

Deno.test(
  "assertValidMetadata rejects metadata without published",
  () => {
    const {
      published: _published,
      ...value
    } = VALID_METADATA;

    assertValidationError(
      () =>
        assertValidMetadata(
          value,
          "metadata",
        ),
      "metadata.published must be a boolean.",
    );
  },
);

Deno.test(
  "assertValidMetadata rejects metadata without featured",
  () => {
    const {
      featured: _featured,
      ...value
    } = VALID_METADATA;

    assertValidationError(
      () =>
        assertValidMetadata(
          value,
          "metadata",
        ),
      "metadata.featured must be a boolean.",
    );
  },
);

function assertValidationError(
  operation: () => void,
  expectedMessage: string,
): void {
  try {
    operation();
  } catch (error) {
    if (
      !(error instanceof
        ValidationError)
    ) {
      throw new Error(
        `Expected ValidationError, received ${String(error)}.`,
      );
    }

    if (
      error.message !==
        expectedMessage
    ) {
      throw new Error(
        [
          "Unexpected validation error.",
          `Expected: ${expectedMessage}`,
          `Actual: ${error.message}`,
        ].join("\n"),
      );
    }

    return;
  }

  throw new Error(
    `Expected validation to fail with "${expectedMessage}".`,
  );
}
