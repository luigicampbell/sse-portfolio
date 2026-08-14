import type { OrderedMetadata } from "./metadata.ts";

export const SKILL_CATEGORIES = [
  "languages",
  "frontend",
  "backend",
  "data",
  "engineering",
  "cloud",
  "salesforce",
  "leadership",
  "dev-ops",
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

export const SKILL_CATEGORY_LABELS: Record<
  SkillCategory,
  string
> = {
  languages: "Languages",

  frontend: "Frontend",

  backend: "Backend",

  data: "Data",

  engineering: "Software Engineering",

  cloud: "Cloud",

  salesforce: "Salesforce",

  leadership: "Leadership",

  "dev-ops": "DevOps",
};

export const SKILL_SUBCATEGORIES = {
  engineering: [
    "architecture",
    "principles",
    "algorithms",
    "data",
    "testing",
  ],

  cloud: [
    "platforms",
    "compute",
    "containers-orchestration",
  ],
} as const;

type SkillSubcategoryMap = typeof SKILL_SUBCATEGORIES;

export type SkillSubcategory = SkillSubcategoryMap[
  keyof SkillSubcategoryMap
][number];

export const SKILL_SUBCATEGORY_LABELS: Record<
  SkillSubcategory,
  string
> = {
  architecture: "Architecture",

  principles: "Principles & Practices",

  algorithms: "Algorithms & Structures",

  data: "Data Engineering",

  testing: "Testing & Quality",

  platforms: "Platforms",

  compute: "Compute",

  "containers-orchestration": "Containers & Orchestration",
};

export interface Skill extends OrderedMetadata {
  label: string;

  category: SkillCategory;

  subcategory?: SkillSubcategory;
}
