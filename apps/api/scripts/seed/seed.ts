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

import { env } from "../../src/config/env.ts";

import { DenoKvPortfolioRepository } from "../../src/repositories/deno-kv-portfolio.repository.ts";
import type { PortfolioRepository } from "../../src/repositories/portfolio.repository.ts";
import { PostgresPortfolioRepository } from "../../src/repositories/postgres-portfolio.repository.ts";

import { SeedService } from "../../src/services/seed.service.ts";
import { SeedPayload } from "@domain/mod.ts";

async function readJson<T>(
  relativePath: string,
): Promise<T> {
  const url = new URL(
    `../../../../content/${relativePath}`,
    import.meta.url,
  );

  const source = await Deno.readTextFile(url);

  return JSON.parse(source) as T;
}

function createRepository(): PortfolioRepository {
  if (env.storageDriver === "kv") {
    return new DenoKvPortfolioRepository(
      env.kvPath,
    );
  }

  const databaseUrl = Deno.env.get("DATABASE_URL");

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required when STORAGE_DRIVER=postgres.",
    );
  }

  return new PostgresPortfolioRepository(
    databaseUrl,
  );
}

async function readSeedPayload(): Promise<SeedPayload> {
  const [
    manifest,
    profile,
    projects,
    skills,
    experience,
    education,
    credentials,
    volunteer,
  ] = await Promise.all([
    readJson<SeedManifest>(
      "manifest.json",
    ),

    readJson<Profile>(
      "profile.json",
    ),

    readJson<Project[]>(
      "projects.json",
    ),

    readJson<Skill[]>(
      "skills.json",
    ),

    readJson<Experience[]>(
      "experience.json",
    ),

    readJson<Education[]>(
      "education.json",
    ),

    readJson<Credential[]>(
      "credentials.json",
    ),

    readJson<VolunteerExperience[]>(
      "volunteer.json",
    ),
  ]);

  return {
    manifest,
    profile,
    projects,
    skills,
    experience,
    education,
    credentials,
    volunteer,
  };
}

async function seed(): Promise<void> {
  const repository = createRepository();

  const service = new SeedService(repository);

  const payload = await readSeedPayload();

  await service.seed(payload);

  console.log(
    "Portfolio content seeded successfully.",
  );

  console.log(
    `Storage driver: ${env.storageDriver}`,
  );
}

if (import.meta.main) {
  await seed();
}
