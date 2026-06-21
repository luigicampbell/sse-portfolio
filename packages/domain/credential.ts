import type { OrderedMetadata } from "./metadata.ts";

export type CredentialStatus = "earned" | "planned";

export interface Credential extends OrderedMetadata {
  name: string;
  issuer: string;
  issued?: string | null;
  expires?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  status: CredentialStatus;
  targetYear?: number;
}
