import type {
  Skill,
} from "@domain/mod.ts";

import {
  summarizeSkillCategories,
} from "../src/charts/skill-data.ts";

Deno.test(
  "summarizeSkillCategories derives count and relative breadth",
  () => {
    const skills: Skill[] = [
      {
        id: "apex",
        label: "Apex",
        category: "salesforce",
        order: 1,
        published: true,
        featured: false,
        createdAt:
          "2026-07-24T00:00:00.000Z",
        updatedAt:
          "2026-07-24T00:00:00.000Z",
      },
      {
        id: "soql",
        label: "SOQL",
        category: "salesforce",
        order: 2,
        published: true,
        featured: false,
        createdAt:
          "2026-07-24T00:00:00.000Z",
        updatedAt:
          "2026-07-24T00:00:00.000Z",
      },
      {
        id: "deno",
        label: "Deno",
        category: "backend",
        order: 3,
        published: true,
        featured: false,
        createdAt:
          "2026-07-24T00:00:00.000Z",
        updatedAt:
          "2026-07-24T00:00:00.000Z",
      },
    ];

    const result =
      summarizeSkillCategories(
        skills,
      );

    const expected = [
      {
        category:
          "salesforce",
        label:
          "Salesforce",
        count: 2,
        breadth: 100,
      },
      {
        category:
          "backend",
        label:
          "Backend",
        count: 1,
        breadth: 50,
      },
    ];

    if (
      JSON.stringify(result) !==
        JSON.stringify(expected)
    ) {
      throw new Error(
        [
          "Unexpected skill summary.",
          `Expected: ${
            JSON.stringify(
              expected,
            )
          }`,
          `Actual: ${
            JSON.stringify(
              result,
            )
          }`,
        ].join("\n"),
      );
    }
  },
);