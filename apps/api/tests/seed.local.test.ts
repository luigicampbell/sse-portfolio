import { readSeedPayload } from "../scripts/seed/seed.ts";

import { TEST_SEED_PAYLOAD } from "./fixtures/seed.mock.ts";

Deno.test(
  "readSeedPayload reads portfolio content from the provided directory",
  async () => {
    const root = await Deno.makeTempDir();

    try {
      await writeSeedContent(
        root,
      );

      const payload = await readSeedPayload(
        root,
      );

      if (
        JSON.stringify(
          payload,
        ) !==
          JSON.stringify(
            TEST_SEED_PAYLOAD,
          )
      ) {
        throw new Error(
          "Expected seed payload to match fixture.",
        );
      }
    } finally {
      await Deno.remove(
        root,
        {
          recursive: true,
        },
      );
    }
  },
);

async function writeSeedContent(
  directory: string,
): Promise<void> {
  const entries = [
    [
      "manifest.json",
      TEST_SEED_PAYLOAD
        .manifest,
    ],
    [
      "profile.json",
      TEST_SEED_PAYLOAD
        .profile,
    ],
    [
      "projects.json",
      TEST_SEED_PAYLOAD
        .projects,
    ],
    [
      "skills.json",
      TEST_SEED_PAYLOAD
        .skills,
    ],
    [
      "experience.json",
      TEST_SEED_PAYLOAD
        .experience,
    ],
    [
      "education.json",
      TEST_SEED_PAYLOAD
        .education,
    ],
    [
      "credentials.json",
      TEST_SEED_PAYLOAD
        .credentials,
    ],
    [
      "volunteer.json",
      TEST_SEED_PAYLOAD
        .volunteer,
    ],
  ] as const;

  for (
    const [
      filename,
      value,
    ] of entries
  ) {
    await Deno.writeTextFile(
      `${directory}/${filename}`,
      JSON.stringify(
        value,
        null,
        2,
      ),
    );
  }
}
