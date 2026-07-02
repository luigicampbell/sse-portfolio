import type { PortfolioPageResponse, Project } from "@domain/mod.ts";

import type {
  PortfolioRepository,
} from "../repositories/portfolio.repository.ts";

export class ProjectNotFoundError extends Error {
  constructor(slug: string) {
    super(`Project not found: ${slug}`);
    this.name = "ProjectNotFoundError";
  }
}

export class PortfolioService {
  constructor(
    private readonly repository: PortfolioRepository,
  ) {}

  async getPortfolioPage(): Promise<PortfolioPageResponse> {
    const [
      profile,
      projects,
      skills,
      experience,
      education,
      credentials,
      volunteerExperience,
    ] = await Promise.all([
      this.repository.getProfile(),
      this.repository.getProjects(),
      this.repository.getSkills(),
      this.repository.getExperience(),
      this.repository.getEducation(),
      this.repository.getCredentials(),
      this.repository.getVolunteerExperience(),
    ]);

    if (!profile) {
      throw new Error("Portfolio profile is not configured");
    }

    if (!profile.published) {
      throw new Error("Portfolio profile is not published");
    }

    const publishedProjects = preparePublished(projects);
    const publishedSkills = preparePublished(skills);
    const publishedExperience = preparePublished(experience);
    const publishedEducation = preparePublished(education);
    const publishedCredentials = preparePublished(credentials);
    const publishedVolunteerExperience = preparePublished(
      volunteerExperience,
    );

    return {
      hero: {
        profile,
      },

      projects: {
        featured: publishedProjects.filter((project) => project.featured),
        all: publishedProjects,
      },

      skills: {
        items: publishedSkills,
      },

      experience: {
        items: publishedExperience,
      },

      education: {
        items: publishedEducation,
      },

      credentials: {
        items: publishedCredentials,
      },

      volunteer: {
        items: publishedVolunteerExperience,
      },
    };
  }

  async getProjects(): Promise<Project[]> {
    const projects = await this.repository.getProjects();

    return preparePublished(projects);
  }

  async getProject(slug: string): Promise<Project> {
    const project = await this.repository.getProject(slug);

    if (!project || !project.published) {
      throw new ProjectNotFoundError(slug);
    }

    return project;
  }
}

function preparePublished<
  T extends {
    published: boolean;
    order: number;
  },
>(values: T[]): T[] {
  return values
    .filter(isPublished)
    .sort(compareByOrder);
}

function isPublished(
  value: { published: boolean },
): boolean {
  return value.published;
}

function compareByOrder(
  left: { order: number },
  right: { order: number },
): number {
  return left.order - right.order;
}
