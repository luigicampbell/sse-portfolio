import type { OrderedMetadata } from "./metadata.ts";

export const SKILL_CATEGORIES = [
  "languages",
  "backend",
  "frontend",
  "data",
  "engineering",
  "cloud",
  "salesforce",
  "leadership",
  "dev-ops",
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

export interface Skill extends OrderedMetadata {
  label: string;
  category: SkillCategory;
}
