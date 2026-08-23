import {
  createPortfolioSectionHref,
  isPortfolioPath,
  normalizeBasePath,
} from "../src/lib/portfolio-navigation.ts";

import { testAssert as expect } from "./helpers/assertions.ts";

Deno.test(
  "normalizeBasePath: preserves the root path",
  () => {
    expect.equals(
      normalizeBasePath("/"),
      "/",
      "Root base path should remain root.",
    );
  },
);

Deno.test(
  "normalizeBasePath: normalizes a nested deployment path",
  () => {
    expect.equals(
      normalizeBasePath("/portfolio"),
      "/portfolio/",
      "Nested base path should have leading and trailing slashes.",
    );
  },
);

Deno.test(
  "isPortfolioPath: recognizes the root portfolio path",
  () => {
    expect.assert(
      isPortfolioPath(
        "/",
        "/",
      ),
      "Root deployment should recognize the root portfolio path.",
    );
  },
);

Deno.test(
  "isPortfolioPath: recognizes the configured Vite base path",
  () => {
    expect.assert(
      isPortfolioPath(
        "/portfolio",
        "/portfolio/",
      ),
      "Nested deployment should recognize its portfolio base path.",
    );

    expect.assert(
      isPortfolioPath(
        "/portfolio/",
        "/portfolio/",
      ),
      "Nested deployment should accept the trailing-slash form.",
    );
  },
);

Deno.test(
  "isPortfolioPath: rejects paths outside the portfolio base",
  () => {
    expect.assert(
      !isPortfolioPath(
        "/missing",
        "/",
      ),
      "Unknown root path should resolve to the not-found experience.",
    );

    expect.assert(
      !isPortfolioPath(
        "/portfolio/missing",
        "/portfolio/",
      ),
      "Unknown nested path should resolve to the not-found experience.",
    );
  },
);

Deno.test(
  "createPortfolioSectionHref: uses the configured base path",
  () => {
    expect.equals(
      createPortfolioSectionHref(
        "/portfolio/",
        "projects",
      ),
      "/portfolio/#projects",
      "Section navigation should remain inside the configured base path.",
    );
  },
);
