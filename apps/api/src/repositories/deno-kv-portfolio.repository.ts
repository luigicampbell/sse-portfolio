import { openKv } from "../db/kv.ts";

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

const SEED_MANIFEST_KEY = [
  "portfolio",
  "seed-manifest",
] as const;

export class DenoKvPortfolioRepository implements PortfolioRepository {
  constructor(
    private readonly path?: string,
  ) {}

  private get kv(): Promise<Deno.Kv> {
    return openKv(
      this.path,
    );
  }

  async getProfile(): Promise<Profile | null> {
    const kv = await this.kv;

    const result = await kv.get<Profile>(
      [
        "portfolio",
        "profile",
      ],
    );

    return result.value;
  }

  getProjects(): Promise<Project[]> {
    return this.getByPrefix<Project>(
      [
        "portfolio",
        "projects",
      ],
      "order",
    );
  }

  async getProject(
    slug: string,
  ): Promise<Project | null> {
    const kv = await this.kv;

    const result = await kv.get<Project>(
      [
        "portfolio",
        "projects",
        slug,
      ],
    );

    return result.value;
  }

  getSkills(): Promise<Skill[]> {
    return this.getByPrefix<Skill>(
      [
        "portfolio",
        "skills",
      ],
    );
  }

  getExperience(): Promise<Experience[]> {
    return this.getByPrefix<Experience>(
      [
        "portfolio",
        "experience",
      ],
      "order",
    );
  }

  getEducation(): Promise<Education[]> {
    return this.getByPrefix<Education>(
      [
        "portfolio",
        "education",
      ],
      "order",
    );
  }

  getCredentials(): Promise<Credential[]> {
    return this.getByPrefix<Credential>(
      [
        "portfolio",
        "credentials",
      ],
      "order",
    );
  }

  getVolunteerExperience(): Promise<
    VolunteerExperience[]
  > {
    return this.getByPrefix<
      VolunteerExperience
    >(
      [
        "portfolio",
        "volunteer",
      ],
      "order",
    );
  }

  async getSeedManifest(): Promise<
    SeedManifest | null
  > {
    const kv = await this.kv;

    const result = await kv.get<SeedManifest>(
      SEED_MANIFEST_KEY,
    );

    return result.value;
  }

  async replaceSeedManifest(
    manifest: SeedManifest,
  ): Promise<void> {
    const kv = await this.kv;

    await kv.set(
      SEED_MANIFEST_KEY,
      manifest,
    );
  }

  async replaceProfile(
    profile: Profile,
  ): Promise<void> {
    const kv = await this.kv;

    await kv.set(
      [
        "portfolio",
        "profile",
      ],
      profile,
    );
  }

  replaceProjects(
    projects: Project[],
  ): Promise<void> {
    return this.replaceCollection(
      [
        "portfolio",
        "projects",
      ],
      projects,
      (project) => project.slug,
    );
  }

  replaceSkills(
    skills: Skill[],
  ): Promise<void> {
    return this.replaceCollection(
      [
        "portfolio",
        "skills",
      ],
      skills,
      (skill) => skill.id,
    );
  }

  replaceExperience(
    experience: Experience[],
  ): Promise<void> {
    return this.replaceCollection(
      [
        "portfolio",
        "experience",
      ],
      experience,
      (item) => item.id,
    );
  }

  replaceEducation(
    education: Education[],
  ): Promise<void> {
    return this.replaceCollection(
      [
        "portfolio",
        "education",
      ],
      education,
      (item) => item.id,
    );
  }

  replaceCredentials(
    credentials: Credential[],
  ): Promise<void> {
    return this.replaceCollection(
      [
        "portfolio",
        "credentials",
      ],
      credentials,
      (item) => item.id,
    );
  }

  replaceVolunteerExperience(
    volunteerExperience: VolunteerExperience[],
  ): Promise<void> {
    return this.replaceCollection(
      [
        "portfolio",
        "volunteer",
      ],
      volunteerExperience,
      (item) => item.id,
    );
  }

  private async getByPrefix<T>(
    prefix: Deno.KvKey,
    orderField?: keyof T,
  ): Promise<T[]> {
    const kv = await this.kv;

    const values: T[] = [];

    for await (
      const entry of kv.list<T>({
        prefix,
      })
    ) {
      values.push(
        entry.value,
      );
    }

    if (
      orderField !== undefined
    ) {
      values.sort(
        (
          left,
          right,
        ) =>
          Number(
            left[orderField] ??
              0,
          ) -
          Number(
            right[orderField] ??
              0,
          ),
      );
    }

    return values;
  }

  private async replaceCollection<T>(
    prefix: Deno.KvKey,
    values: T[],
    getId: (
      value: T,
    ) => string,
  ): Promise<void> {
    const kv = await this.kv;

    const existingKeys: Deno.KvKey[] = [];

    for await (
      const entry of kv.list({
        prefix,
      })
    ) {
      existingKeys.push(
        entry.key,
      );
    }

    const operations: Array<
      | {
        type: "delete";
        key: Deno.KvKey;
      }
      | {
        type: "set";
        key: Deno.KvKey;
        value: T;
      }
    > = [
      ...existingKeys.map(
        (key) => ({
          type: "delete" as const,
          key,
        }),
      ),

      ...values.map(
        (value) => ({
          type: "set" as const,
          key: [
            ...prefix,
            getId(
              value,
            ),
          ],
          value,
        }),
      ),
    ];

    const batchSize = 50;

    for (
      let index = 0;
      index <
        operations.length;
      index += batchSize
    ) {
      const batch = operations.slice(
        index,
        index +
          batchSize,
      );

      const transaction = kv.atomic();

      for (
        const operation of batch
      ) {
        if (
          operation.type ===
            "delete"
        ) {
          transaction.delete(
            operation.key,
          );
        } else {
          transaction.set(
            operation.key,
            operation.value,
          );
        }
      }

      const result = await transaction
        .commit();

      if (!result.ok) {
        throw new Error(
          "Failed to replace KV collection.",
        );
      }
    }
  }
}
