import type { Credential } from "./credential.ts";
import type { Education } from "./education.ts";
import type { Experience } from "./experience.ts";
import type { Profile } from "./profile.ts";
import type { Project } from "./project.ts";
import type { Skill } from "./skill.ts";
import type { VolunteerExperience } from "./volunteer-experience.ts";

export interface PortfolioPageResponse {
  hero: {
    profile: Profile;
  };

  projects: {
    featured: Project[];
    all: Project[];
  };

  skills: {
    items: Skill[];
  };

  experience: {
    items: Experience[];
  };

  education: {
    items: Education[];
  };

  credentials: {
    items: Credential[];
  };

  volunteer: {
    items: VolunteerExperience[];
  };
}
