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

  private notImplemented<T>(
    operation: string,
  ): Promise<T> {
    return Promise.reject(
      new Error(
        `PostgreSQL repository operation "${operation}" is not implemented.`,
      ),
    );
  }
  getProfile(): Promise<Profile | null> {
    throw new Error(
      `PostgreSQL repository is not implemented: ${this.databaseUrl}`,
    );
  }

  getProjects(): Promise<Project[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  getProject(
    _slug: string,
  ): Promise<Project | null> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  getSkills(): Promise<Skill[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  getExperience(): Promise<Experience[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  getEducation(): Promise<Education[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  getCredentials(): Promise<Credential[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  getVolunteerExperience(): Promise<VolunteerExperience[]> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  getSeedManifest(): Promise<SeedManifest | null> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  replaceProfile(
    _profile: Profile,
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  replaceProjects(
    _projects: Project[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  replaceSkills(
    _skills: Skill[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  replaceExperience(
    _experience: Experience[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  replaceEducation(
    _education: Education[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  replaceCredentials(
    _credentials: Credential[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  replaceVolunteerExperience(
    _volunteerExperience: VolunteerExperience[],
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }

  replaceSeedManifest(
    _manifest: SeedManifest,
  ): Promise<void> {
    throw new Error(
      "PostgreSQL repository is not implemented.",
    );
  }
}
