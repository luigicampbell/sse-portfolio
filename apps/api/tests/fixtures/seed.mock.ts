import type { SeedPayload } from "@domain/mod.ts";

export const TEST_TIMESTAMP = "2026-08-11T00:00:00.000Z";

export const TEST_SEED_PAYLOAD: SeedPayload = {
  manifest: {
    seedVersion: 0,
    schemaVersion: 0,
    contentVersion: "0.0.0",
  },

  profile: {
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
  },

  projects: [],
  skills: [],
  experience: [],
  education: [],
  credentials: [],
  volunteer: [],
};
