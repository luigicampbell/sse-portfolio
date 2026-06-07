import type {
  Credential,
  Education,
  Experience,
  Profile,
  Project,
  SeedManifest,
  Skill,
  VolunteerExperience,
} from "@domain/mod.ts";

export interface PortfolioRepository {
  getProfile(): Promise<Profile | null>;

  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;

  getSkills(): Promise<Skill[]>;
  getExperience(): Promise<Experience[]>;
  getEducation(): Promise<Education[]>;
  getCredentials(): Promise<Credential[]>;
  getVolunteerExperience(): Promise<VolunteerExperience[]>;

  getSeedManifest(): Promise<SeedManifest | null>;

  replaceProfile(profile: Profile): Promise<void>;
  replaceProjects(projects: Project[]): Promise<void>;
  replaceSkills(skills: Skill[]): Promise<void>;
  replaceExperience(experience: Experience[]): Promise<void>;
  replaceEducation(education: Education[]): Promise<void>;
  replaceCredentials(credentials: Credential[]): Promise<void>;
  replaceVolunteerExperience(
    volunteerExperience: VolunteerExperience[],
  ): Promise<void>;
  replaceSeedManifest(manifest: SeedManifest): Promise<void>;
}
