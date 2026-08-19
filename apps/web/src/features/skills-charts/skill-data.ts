import { SKILL_CATEGORY_LABELS } from "@domain/mod.ts";

import type { Skill } from "@domain/mod.ts";

export interface SkillCategorySummary {
  category: Skill["category"];

  label: string;

  count: number;

  breadth: number;
}

interface SkillCategoryMetrics {
  category: Skill["category"];

  count: number;

  subcategoryCount: number;
}

const MAX_BREADTH = 100;

export function summarizeSkillCategories(
  skills: Skill[],
): SkillCategorySummary[] {
  const metrics = collectCategoryMetrics(
    skills,
  );

  const maximumFlatCount = Math.max(
    ...metrics
      .filter(
        (metric) =>
          metric
            .subcategoryCount ===
            0,
      )
      .map(
        (metric) => metric.count,
      ),
    1,
  );

  const maximumSubcategoryCount = Math.max(
    ...metrics
      .filter(
        (metric) =>
          metric
            .subcategoryCount >
            0,
      )
      .map(
        (metric) =>
          metric
            .subcategoryCount,
      ),
    1,
  );

  return metrics
    .map(
      (metric) => ({
        category: metric.category,

        label: SKILL_CATEGORY_LABELS[
          metric.category
        ],

        count: metric.count,

        breadth: calculateBreadth(
          metric,
          maximumFlatCount,
          maximumSubcategoryCount,
        ),
      }),
    )
    .sort(
      (
        left,
        right,
      ) =>
        right.breadth -
        left.breadth,
    );
}

function collectCategoryMetrics(
  skills: Skill[],
): SkillCategoryMetrics[] {
  const categories = new Map<
    Skill["category"],
    {
      count: number;
      subcategories: Set<string>;
    }
  >();

  for (const skill of skills) {
    const existing = categories.get(
      skill.category,
    ) ?? {
      count: 0,
      subcategories: new Set<string>(),
    };

    existing.count += 1;

    if (
      skill.subcategory
    ) {
      existing
        .subcategories
        .add(
          skill.subcategory,
        );
    }

    categories.set(
      skill.category,
      existing,
    );
  }

  return [
    ...categories.entries(),
  ].map(
    ([
      category,
      value,
    ]) => ({
      category,

      count: value.count,

      subcategoryCount: value
        .subcategories
        .size,
    }),
  );
}

function calculateBreadth(
  metric: SkillCategoryMetrics,
  maximumFlatCount: number,
  maximumSubcategoryCount: number,
): number {
  if (
    metric.category ===
      "engineering"
  ) {
    return MAX_BREADTH;
  }

  if (
    metric.subcategoryCount >
      0
  ) {
    return normalizeBreadth(
      metric.subcategoryCount,
      maximumSubcategoryCount,
    );
  }

  return normalizeBreadth(
    metric.count,
    maximumFlatCount,
  );
}

function normalizeBreadth(
  value: number,
  maximum: number,
): number {
  return Math.min(
    MAX_BREADTH,
    Math.round(
      (
        value /
        maximum
      ) * MAX_BREADTH,
    ),
  );
}
