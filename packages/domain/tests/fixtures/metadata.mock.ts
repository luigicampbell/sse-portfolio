import type { Metadata, OrderedMetadata } from "../../metadata.ts";

export const VALID_METADATA: Metadata = {
  id: "test-item",
  createdAt: "2026-07-24T00:00:00.000Z",
  updatedAt: "2026-07-24T00:00:00.000Z",
  published: true,
  featured: false,
};

export const VALID_ORDERED_METADATA: OrderedMetadata = {
  ...VALID_METADATA,
  order: 1,
};
