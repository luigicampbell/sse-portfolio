import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";

import type {
  Credential,
  Education,
  Experience,
  Profile,
  Project,
  Skill,
  VolunteerExperience,
} from "@domain/mod.ts";

import { DenoKvPortfolioRepository } from "../src/repositories/deno-kv-portfolio.repository.ts";
import { registerSitemapRoutes } from "../src/routes/public/sitemap.routes.ts";
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

const projects: Project[] = [];

const skills: Skill[] = [];

const experience: Experience[] = [];

const education: Education[] = [];

const credentials: Credential[] = [];

const volunteer: VolunteerExperience[] = [];

Deno.test({
  name: "sitemap route returns XML sitemap",

  sanitizeResources: false,

  async fn() {
    const directory = await Deno.makeTempDir();

    const kvPath = `${directory}/sitemap-test.db`;

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

      await repository.replaceEducation(
        education,
      );

      await repository.replaceCredentials(
        credentials,
      );

      await repository.replaceVolunteerExperience(
        volunteer,
      );

      const response = await app.handle(
        new Request(
          "http://localhost/sitemap.xml",
        ),
      );

      if (!response) {
        throw new Error(
          "Expected /sitemap.xml to return a response.",
        );
      }

      if (response.status !== 200) {
        throw new Error(
          `Expected status 200, received ${response.status}.`,
        );
      }

      const contentType = response.headers.get(
        "content-type",
      );

      if (
        !contentType?.includes(
          "application/xml",
        )
      ) {
        throw new Error(
          `Expected XML content type, received ${contentType}.`,
        );
      }

      const body = await response.text();

      if (
        !body.includes(
          "<urlset",
        )
      ) {
        throw new Error(
          "Expected sitemap XML to contain a urlset.",
        );
      }

      if (
        !body.includes(
          "<lastmod>2026-07-24</lastmod>",
        )
      ) {
        throw new Error(
          "Expected sitemap to use the latest content timestamp.",
        );
      }

      if (
        !body.includes(
          "<priority>1.0</priority>",
        )
      ) {
        throw new Error(
          "Expected root sitemap entry to have priority 1.0.",
        );
      }
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

  registerSitemapRoutes(
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
