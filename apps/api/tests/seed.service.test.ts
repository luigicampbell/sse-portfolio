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
  DenoKvPortfolioRepository,
} from "../src/repositories/deno-kv-portfolio.repository.ts";

import { SeedService } from "../src/services/seed.service.ts";

const TEST_TIMESTAMP = "2026-08-10T00:00:00.000Z";

const manifest: SeedManifest = {
  seedVersion: 0,
  schemaVersion: 0,
  contentVersion: "0.0.0",
};

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

const payload: SeedPayload = {
  manifest,
  profile,
  projects,
  skills,
  experience,
  education,
  credentials,
  volunteer,
};

Deno.test({
  name: "SeedService seeds the complete portfolio payload",
  sanitizeResources: false,

  async fn() {
    const directory = await Deno.makeTempDir();

    const kvPath = `${directory}/seed-service-test.db`;

    const repository = new DenoKvPortfolioRepository(
      kvPath,
    );

    const service = new SeedService(repository);

    try {
      await service.seed(payload);

      const [
        storedManifest,
        storedProfile,
        storedProjects,
        storedSkills,
        storedExperience,
        storedEducation,
        storedCredentials,
        storedVolunteer,
      ] = await Promise.all([
        repository.getSeedManifest(),
        repository.getProfile(),
        repository.getProjects(),
        repository.getSkills(),
        repository.getExperience(),
        repository.getEducation(),
        repository.getCredentials(),
        repository.getVolunteerExperience(),
      ]);

      if (
        storedManifest?.contentVersion !==
          manifest.contentVersion
      ) {
        throw new Error(
          "Expected seed manifest to be persisted.",
        );
      }

      if (
        storedProfile?.id !==
          profile.id
      ) {
        throw new Error(
          "Expected profile to be persisted.",
        );
      }

      if (
        storedProjects.length !==
          projects.length
      ) {
        throw new Error(
          "Expected projects to be persisted.",
        );
      }

      if (
        storedSkills.length !==
          skills.length
      ) {
        throw new Error(
          "Expected skills to be persisted.",
        );
      }

      if (
        storedExperience.length !==
          experience.length
      ) {
        throw new Error(
          "Expected experience to be persisted.",
        );
      }

      if (
        storedEducation.length !==
          education.length
      ) {
        throw new Error(
          "Expected education to be persisted.",
        );
      }

      if (
        storedCredentials.length !==
          credentials.length
      ) {
        throw new Error(
          "Expected credentials to be persisted.",
        );
      }

      if (
        storedVolunteer.length !==
          volunteer.length
      ) {
        throw new Error(
          "Expected volunteer experience to be persisted.",
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
