import type { Skill } from "@domain/mod.ts";

interface SkillCategorySummary {
  category: Skill["category"];
  label: string;
  average: number;
}

const categoryLabels: Record<Skill["category"], string> = {
  "languages": "TypeScript",
  frontend: "Frontend",
  backend: "Backend",
  data: "Data",
  cloud: "Cloud",
  salesforce: "Salesforce",
  leadership: "Leadership",
};

export function summarizeSkillCategories(
  skills: Skill[],
): SkillCategorySummary[] {
  const groupedSkills = new Map<Skill["category"], number[]>();

  for (const skill of skills) {
    const existing = groupedSkills.get(skill.category) ?? [];
    existing.push(skill.score);
    groupedSkills.set(skill.category, existing);
  }

  return [...groupedSkills.entries()]
    .map(([category, scores]) => {
      const total = scores.reduce((sum, score) => sum + score, 0);

      return {
        category,
        label: categoryLabels[category],
        average: Math.round(total / scores.length),
      };
    })
    .sort((left, right) => right.average - left.average);
}
