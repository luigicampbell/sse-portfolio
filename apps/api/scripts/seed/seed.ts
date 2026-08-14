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

const DEFAULT_CONTENT_DIRECTORY = new URL(
  "../../../../content/",
  import.meta.url,
);

async function readJson<T>(
  contentDirectory: URL,
  relativePath: string,
): Promise<T> {
  const url = new URL(
    relativePath,
    contentDirectory,
  );

  const source = await Deno.readTextFile(
    url,
  );

  return JSON.parse(
    source,
  ) as T;
}

function createRepository(): PortfolioRepository {
  if (
    env.storageDriver ===
      "kv"
  ) {
    return new DenoKvPortfolioRepository(
      env.kvPath,
    );
  }

  const databaseUrl = Deno.env.get(
    "DATABASE_URL",
  );

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required when STORAGE_DRIVER=postgres.",
    );
  }

  return new PostgresPortfolioRepository(
    databaseUrl,
  );
}

export async function readSeedPayload(
  contentDirectory: string | URL = resolveContentDirectory(),
): Promise<SeedPayload> {
  const directory = toDirectoryUrl(
    contentDirectory,
  );

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
      directory,
      "manifest.json",
    ),

    readJson<Profile>(
      directory,
      "profile.json",
    ),

    readJson<Project[]>(
      directory,
      "projects.json",
    ),

    readJson<Skill[]>(
      directory,
      "skills.json",
    ),

    readJson<Experience[]>(
      directory,
      "experience.json",
    ),

    readJson<Education[]>(
      directory,
      "education.json",
    ),

    readJson<Credential[]>(
      directory,
      "credentials.json",
    ),

    readJson<
      VolunteerExperience[]
    >(
      directory,
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

function resolveContentDirectory(): URL {
  const configured = Deno.env.get(
    "SEED_CONTENT_DIR",
  );

  if (!configured) {
    return DEFAULT_CONTENT_DIRECTORY;
  }

  return toDirectoryUrl(
    configured,
  );
}

function toDirectoryUrl(
  value: string | URL,
): URL {
  if (
    value instanceof URL
  ) {
    return ensureTrailingSlash(
      value,
    );
  }

  const url = value.startsWith(
      "file:",
    )
    ? new URL(value)
    : new URL(
      `file://${
        resolveAbsolutePath(
          value,
        )
      }`,
    );

  return ensureTrailingSlash(
    url,
  );
}

function resolveAbsolutePath(
  path: string,
): string {
  if (
    path.startsWith("/")
  ) {
    return path;
  }

  const cwd = Deno.cwd()
    .replace(
      /\/+$/,
      "",
    );

  const relative = path.replace(
    /^\.?\//,
    "",
  );

  return `${cwd}/${relative}`;
}

function ensureTrailingSlash(
  url: URL,
): URL {
  if (
    url.pathname.endsWith(
      "/",
    )
  ) {
    return url;
  }

  const normalized = new URL(
    url.href,
  );

  normalized.pathname += "/";

  return normalized;
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
    if (
      error instanceof Error
    ) {
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
