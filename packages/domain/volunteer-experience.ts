import type { OrderedMetadata } from "./metadata.ts";

export interface VolunteerExperience extends OrderedMetadata {
  organization: string;
  role: string;
  location?: string;
  startDate?: string | null;
  endDate?: string | null;
  hours?: number;
  summary: string;
  highlights: string[];
}
