import type { OrderedMetadata } from "./metadata.ts";

export interface Experience extends OrderedMetadata {
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
}
