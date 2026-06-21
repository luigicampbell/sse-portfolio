import type { OrderedMetadata } from "./metadata.ts";

export interface Education extends OrderedMetadata {
  institution: string;
  credential: string;
  field: string;
  location?: string;
  startDate?: string | null;
  endDate?: string | null;
  description: string;
  highlights: string[];
}
