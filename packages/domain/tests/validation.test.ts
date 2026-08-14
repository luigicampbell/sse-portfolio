import { assertValidMetadata, ValidationError } from "../validation.ts";

import { VALID_METADATA } from "./fixtures/metadata.mock.ts";

Deno.test(
  "assertValidMetadata accepts valid metadata",
  () => {
    assertValidMetadata(
      VALID_METADATA,
    );
  },
);

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

Deno.test(
  "assertValidMetadata accepts metadata without optional tags",
  () => {
    assertValidMetadata(
      VALID_METADATA,
    );
  },
);

Deno.test(
  "assertValidMetadata rejects non-string tags",
  () => {
    const value = {
      ...VALID_METADATA,
      tags: [
        "typescript",
        42,
      ],
    };

    assertValidationError(
      () =>
        assertValidMetadata(
          value,
          "metadata",
        ),
      "metadata.tags must be an array of strings when provided.",
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
      !(error instanceof ValidationError)
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
