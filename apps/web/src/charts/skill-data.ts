import { SKILL_CATEGORY_LABELS } from "@domain/mod.ts";

import type { Skill } from "@domain/mod.ts";

export interface SkillCategorySummary {
  category: Skill["category"];

  label: string;

  count: number;

  breadth: number;
}

export function summarizeSkillCategories(
  skills: Skill[],
): SkillCategorySummary[] {
  const counts = new Map<
    Skill["category"],
    number
  >();

  for (const skill of skills) {
    counts.set(
      skill.category,
      (
        counts.get(
          skill.category,
        ) ?? 0
      ) + 1,
    );
  }

  const summaries = [...counts.entries()]
    .map(
      ([
        category,
        count,
      ]) => ({
        category,

        label: SKILL_CATEGORY_LABELS[
          category
        ],

        count,
      }),
    )
    .sort(
      (
        left,
        right,
      ) =>
        right.count -
        left.count,
    );

  const maximumCount = Math.max(
    ...summaries.map(
      (summary) => summary.count,
    ),
    1,
  );

  return summaries.map(
    (summary) => ({
      ...summary,

      breadth: Math.round(
        (
          summary.count /
          maximumCount
        ) * 100,
      ),
    }),
  );
}
