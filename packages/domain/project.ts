import type { OrderedMetadata } from "./metadata.ts";

export interface ProjectLink {
  id: string;
  label: string;
  url: string;
}

export interface Project extends OrderedMetadata {
  slug: string;
  title: string;
  summary: string;
  description?: string;
  image?: string;
  technologies: string[];
  links: ProjectLink[];
}
