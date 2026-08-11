import type { Credential } from "./credential.ts";
import type { Education } from "./education.ts";
import type { Experience } from "./experience.ts";
import type { Profile } from "./profile.ts";
import type { Project } from "./project.ts";
import type { SeedManifest } from "./seed-manifest.ts";
import type { Skill } from "./skill.ts";
import type { VolunteerExperience } from "./volunteer-experience.ts";

export interface SeedPayload {
  manifest: SeedManifest;
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  credentials: Credential[];
  volunteer: VolunteerExperience[];
}
