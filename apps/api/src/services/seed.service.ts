import type { SeedPayload } from "@domain/mod.ts";

import {
  hasValidMetadataCollection,
  hasValidProfile,
  hasValidSeedManifest,
} from "@domain/validation.ts";

import type {
  PortfolioRepository,
} from "../repositories/portfolio.repository.ts";

export interface SeedServicePort {
  seed(
    payload: SeedPayload,
  ): Promise<void>;
}

export class SeedService implements SeedServicePort {
  constructor(
    private readonly repository: PortfolioRepository,
  ) {}

  async seed(
    payload: SeedPayload,
  ): Promise<void> {
    await this.repository.replaceProfile(
      payload.profile,
    );

    await this.repository.replaceProjects(
      payload.projects,
    );

    await this.repository.replaceSkills(
      payload.skills,
    );

    await this.repository.replaceExperience(
      payload.experience,
    );

    await this.repository.replaceEducation(
      payload.education,
    );

    await this.repository.replaceCredentials(
      payload.credentials,
    );

    await this.repository
      .replaceVolunteerExperience(
        payload.volunteer,
      );

    await this.repository
      .replaceSeedManifest(
        payload.manifest,
      );
  }
}

export function isValidSeedPayload(
  value: unknown,
): value is SeedPayload {
  if (!isRecord(value)) {
    return false;
  }

  return hasValidSeedManifest(
    value.manifest,
  ) &&
    hasValidProfile(
      value.profile,
    ) &&
    hasValidMetadataCollection(
      value.projects,
    ) &&
    hasValidMetadataCollection(
      value.skills,
    ) &&
    hasValidMetadataCollection(
      value.experience,
    ) &&
    hasValidMetadataCollection(
      value.education,
    ) &&
    hasValidMetadataCollection(
      value.credentials,
    ) &&
    hasValidMetadataCollection(
      value.volunteer,
    );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value);
}
