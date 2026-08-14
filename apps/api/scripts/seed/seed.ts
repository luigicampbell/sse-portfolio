import type {
  Credential,
  Education,
  Experience,
  Profile,
  Project,
  SeedManifest,
  SeedPayload,
  Skill,
  VolunteerExperience,
} from "@domain/mod.ts";

import {
  assertValidMetadataCollection,
  assertValidProfile,
  assertValidSeedManifest,
} from "@domain/validation.ts";

import { env } from "../../src/config/env.ts";

import { DenoKvPortfolioRepository } from "../../src/repositories/deno-kv-portfolio.repository.ts";
import type { PortfolioRepository } from "../../src/repositories/portfolio.repository.ts";
import { PostgresPortfolioRepository } from "../../src/repositories/postgres-portfolio.repository.ts";

import { SeedService } from "../../src/services/seed.service.ts";

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

function validateSeedPayload(
  payload: SeedPayload,
): void {
  assertValidSeedManifest(
    payload.manifest,
    "manifest",
  );

  assertValidProfile(
    payload.profile,
    "profile",
  );

  assertValidMetadataCollection(
    payload.projects,
    "projects",
  );

  assertValidMetadataCollection(
    payload.skills,
    "skills",
  );

  assertValidMetadataCollection(
    payload.experience,
    "experience",
  );

  assertValidMetadataCollection(
    payload.education,
    "education",
  );

  assertValidMetadataCollection(
    payload.credentials,
    "credentials",
  );

  assertValidMetadataCollection(
    payload.volunteer,
    "volunteer",
  );
}

async function seed(): Promise<void> {
  const repository = createRepository();

  const service = new SeedService(
    repository,
  );

  const payload = await readSeedPayload();

  try {
    validateSeedPayload(
      payload,
    );
  } catch (error) {
    console.error(
      "Portfolio seed validation failed.",
    );

    throw error;
  }

  try {
    await service.seed(
      payload,
    );
  } catch (error) {
    console.error(
      "Portfolio seed persistence failed.",
    );

    throw error;
  }

  console.log(
    "Portfolio content seeded successfully.",
  );

  console.log(
    `Storage driver: ${env.storageDriver}`,
  );
}

if (import.meta.main) {
  try {
    await seed();
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `${error.name}: ${error.message}`,
      );

      if (error.stack) {
        console.error(
          error.stack,
        );
      }
    } else {
      console.error(
        "Unknown seed error:",
        error,
      );
    }

    Deno.exit(1);
  }
}
