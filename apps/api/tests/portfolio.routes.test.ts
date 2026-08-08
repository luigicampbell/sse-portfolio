import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";

import type {
  Experience,
  PortfolioPageResponse,
  Profile,
  Project,
  Skill,
} from "@domain/mod.ts";

import { DenoKvPortfolioRepository } from "../src/repositories/deno-kv-portfolio.repository.ts";
import { registerPortfolioRoutes } from "../src/routes/v1/portfolio.routes.ts";
import { PortfolioService } from "../src/services/portfolio.service.ts";

const TEST_TIMESTAMP = "2026-07-24T00:00:00.000Z";

const profile: Profile = {
  id: "profile-main",
  name: "Test Developer",
  eyebrow: "Portfolio",
  headline: "Software Developer",
  summary: [
    {
      text: "Test portfolio profile.",
    },
  ],
  location: "Los Angeles, CA",
  actions: [],
  metrics: [],
  socials: [],
  published: true,
  featured: true,
  tags: [],
  createdAt: TEST_TIMESTAMP,
  updatedAt: TEST_TIMESTAMP,
};

const projects: Project[] = [
  {
    id: "project-test",
    slug: "test-project",
    title: "Test Project",
    summary: "A project used by the portfolio route tests.",
    description: "Integration-test project.",
    technologies: [
      "Deno",
      "TypeScript",
    ],
    links: [],
    order: 1,
    published: true,
    featured: true,
    tags: [
      "test",
    ],
    createdAt: TEST_TIMESTAMP,
    updatedAt: TEST_TIMESTAMP,
  },
];

const skills: Skill[] = [
  {
    id: "skill-typescript",
    label: "TypeScript",
    category: "languages",
    order: 1,
    published: true,
    featured: true,
    tags: [
      "test",
    ],
    createdAt: TEST_TIMESTAMP,
    updatedAt: TEST_TIMESTAMP,
  },
];

const experience: Experience[] = [
  {
    id: "experience-test",
    organization: "Test Company",
    role: "Developer",
    summary: "Test experience record.",
    highlights: [
      "Built and tested a Deno portfolio application.",
    ],
    startDate: "2025-01-01",
    order: 1,
    published: true,
    featured: true,
    tags: [
      "test",
    ],
    createdAt: TEST_TIMESTAMP,
    updatedAt: TEST_TIMESTAMP,
  },
];

Deno.test({
  name: "portfolio routes return page data, projects, and 404",
  sanitizeResources: false,

  async fn(t) {
    const directory = await Deno.makeTempDir();

    const kvPath = `${directory}/portfolio-test.db`;

    const repository = new DenoKvPortfolioRepository(
      kvPath,
    );

    const service = new PortfolioService(
      repository,
    );

    const app = createTestApplication(
      service,
    );

    try {
      await repository.replaceProfile(
        profile,
      );

      await repository.replaceProjects(
        projects,
      );

      await repository.replaceSkills(
        skills,
      );

      await repository.replaceExperience(
        experience,
      );

      await t.step(
        "GET /api/v1/portfolio returns page-oriented data",
        async () => {
          const response = await handleRequest(
            app,
            "/api/v1/portfolio",
          );

          if (response.status !== 200) {
            throw new Error(
              `Expected status 200, received ${response.status}.`,
            );
          }

          const body = await response
            .json() as PortfolioPageResponse;

          if (
            body.hero.profile.id !==
              profile.id
          ) {
            throw new Error(
              `Expected profile ID ${profile.id}.`,
            );
          }

          if (
            body.projects.all.length !==
              1
          ) {
            throw new Error(
              "Expected the page response to contain one project.",
            );
          }

          if (
            body.projects.featured
              .length !== 1
          ) {
            throw new Error(
              "Expected the page response to contain one featured project.",
            );
          }

          if (
            body.projects.featured[0]
              ?.slug !==
              "test-project"
          ) {
            throw new Error(
              "Expected the test project to be featured.",
            );
          }

          if (
            body.skills.items.length !==
              1
          ) {
            throw new Error(
              "Expected the page response to contain one skill.",
            );
          }

          if (
            body.experience.items
              .length !== 1
          ) {
            throw new Error(
              "Expected the page response to contain one experience record.",
            );
          }
        },
      );

      await t.step(
        "GET /api/v1/projects returns published projects",
        async () => {
          const response = await handleRequest(
            app,
            "/api/v1/projects",
          );

          if (response.status !== 200) {
            throw new Error(
              `Expected status 200, received ${response.status}.`,
            );
          }

          const body = await response.json() as Project[];

          if (!Array.isArray(body)) {
            throw new Error(
              "Expected the response body to be an array.",
            );
          }

          if (body.length !== 1) {
            throw new Error(
              "Expected one published project.",
            );
          }

          if (
            body[0]?.slug !==
              "test-project"
          ) {
            throw new Error(
              "Expected the test project to be returned.",
            );
          }
        },
      );

      await t.step(
        "GET /api/v1/projects/:slug returns the project",
        async () => {
          const response = await handleRequest(
            app,
            "/api/v1/projects/test-project",
          );

          if (response.status !== 200) {
            throw new Error(
              `Expected status 200, received ${response.status}.`,
            );
          }

          const body = await response.json() as Project;

          if (
            body.slug !==
              "test-project"
          ) {
            throw new Error(
              "Expected the requested project to be returned.",
            );
          }
        },
      );

      await t.step(
        "GET /api/v1/projects/:slug returns 404 for an unknown project",
        async () => {
          const response = await handleRequest(
            app,
            "/api/v1/projects/missing-project",
          );

          if (response.status !== 404) {
            throw new Error(
              `Expected status 404, received ${response.status}.`,
            );
          }

          const body = await response.json() as {
            error: string;
          };

          if (
            body.error !==
              "Project not found."
          ) {
            throw new Error(
              "Expected a project-not-found response.",
            );
          }
        },
      );
    } finally {
      await Deno.remove(
        directory,
        {
          recursive: true,
        },
      );
    }
  },
});

function createTestApplication(
  service: PortfolioService,
): Application {
  const app = new Application();
  const router = new Router();

  registerPortfolioRoutes(
    router,
    service,
  );

  app.use(
    router.routes(),
  );

  app.use(
    router.allowedMethods(),
  );

  return app;
}

async function handleRequest(
  app: Application,
  pathname: string,
): Promise<Response> {
  const response = await app.handle(
    new Request(
      `http://localhost${pathname}`,
    ),
  );

  if (!response) {
    throw new Error(
      `Expected ${pathname} to return a response.`,
    );
  }

  return response;
}
