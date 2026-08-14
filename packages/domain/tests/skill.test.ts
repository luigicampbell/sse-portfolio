import {
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  SKILL_SUBCATEGORIES,
  SKILL_SUBCATEGORY_LABELS,
} from "../skill.ts";

Deno.test(
  "skill taxonomy includes software engineering",
  () => {
    if (
      !SKILL_CATEGORIES.includes(
        "engineering",
      )
    ) {
      throw new Error(
        "Expected engineering skill category.",
      );
    }
  },
);

Deno.test(
  "engineering exposes focused subcategories",
  () => {
    const expected = [
      "architecture",
      "principles",
      "algorithms",
      "data",
      "testing",
    ];

    const actual = [
      ...SKILL_SUBCATEGORIES
        .engineering,
    ];

    if (
      JSON.stringify(actual) !==
        JSON.stringify(expected)
    ) {
      throw new Error(
        [
          "Unexpected engineering subcategories.",
          `Expected: ${JSON.stringify(expected)}`,
          `Actual: ${JSON.stringify(actual)}`,
        ].join("\n"),
      );
    }
  },
);

Deno.test(
  "cloud exposes focused subcategories",
  () => {
    const expected = [
      "platforms",
      "compute",
      "containers-orchestration",
    ];

    const actual = [
      ...SKILL_SUBCATEGORIES.cloud,
    ];

    if (
      JSON.stringify(actual) !==
        JSON.stringify(expected)
    ) {
      throw new Error(
        [
          "Unexpected cloud subcategories.",
          `Expected: ${JSON.stringify(expected)}`,
          `Actual: ${JSON.stringify(actual)}`,
        ].join("\n"),
      );
    }
  },
);

Deno.test(
  "skill taxonomy exposes display labels",
  () => {
    if (
      SKILL_CATEGORY_LABELS
        .engineering !==
        "Software Engineering"
    ) {
      throw new Error(
        "Expected Software Engineering category label.",
      );
    }

    if (
      SKILL_SUBCATEGORY_LABELS[
        "containers-orchestration"
      ] !==
        "Containers & Orchestration"
    ) {
      throw new Error(
        "Expected Containers & Orchestration subcategory label.",
      );
    }
  },
);
