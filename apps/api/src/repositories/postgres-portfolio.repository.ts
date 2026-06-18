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

import type { PortfolioRepository } from "./portfolio.repository.ts";

export class PostgresPortfolioRepository implements PortfolioRepository {
  constructor(
    private readonly databaseUrl: string,
  ) {}

  async getProfile(): Promise<Profile | null> {
    throw new Error(
      `PostgreSQL repository is not implemented: ${this.databaseUrl}`,
    );
  }

  async getProjects(): Promise<Project[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async getProject(
    _slug: string,
  ): Promise<Project | null> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async getSkills(): Promise<Skill[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async getExperience(): Promise<Experience[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async getEducation(): Promise<Education[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async getCredentials(): Promise<Credential[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async getVolunteerExperience(): Promise<VolunteerExperience[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async getSeedManifest(): Promise<SeedManifest | null> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async replaceProfile(
    _profile: Profile,
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async replaceProjects(
    _projects: Project[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async replaceSkills(
    _skills: Skill[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async replaceExperience(
    _experience: Experience[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async replaceEducation(
    _education: Education[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async replaceCredentials(
    _credentials: Credential[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async replaceVolunteerExperience(
    _volunteerExperience: VolunteerExperience[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  async replaceSeedManifest(
    _manifest: SeedManifest,
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }
}
