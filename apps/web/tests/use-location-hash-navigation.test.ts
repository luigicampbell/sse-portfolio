import {
  getLocationHashTargetId,
} from "../src/lib/use-location-hash-navigation.ts";

import { testAssert as expect } from "./helpers/assertions.ts";

Deno.test(
  "location hash navigation: extracts section IDs",
  () => {
    expect.equals(
      getLocationHashTargetId(
        "#skills",
      ),
      "skills",
      "Skills hash should resolve to the skills section ID.",
    );

    expect.equals(
      getLocationHashTargetId(
        "#experience",
      ),
      "experience",
      "Experience hash should resolve to the experience section ID.",
    );

    expect.equals(
      getLocationHashTargetId(""),
      null,
      "An empty hash should not resolve to a section ID.",
    );

    expect.equals(
      getLocationHashTargetId("#"),
      null,
      "A hash without a section ID should not resolve.",
    );
  },
);

Deno.test(
  "location hash navigation: decodes encoded section IDs",
  () => {
    expect.equals(
      getLocationHashTargetId(
        "#project%20details",
      ),
      "project details",
      "Encoded hash values should be decoded.",
    );
  },
);

Deno.test(
  "location hash navigation: rejects malformed encoded hashes",
  () => {
    expect.equals(
      getLocationHashTargetId(
        "#%E0%A4%A",
      ),
      null,
      "Malformed encoded hashes should not resolve to a section ID.",
    );
  },
);
