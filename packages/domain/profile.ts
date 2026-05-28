import type { Metadata } from "./metadata.ts";

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface ProfileImageSource {
  src: string;
  width: number;
}

export interface ProfileAvatar {
  sources: {
    webp: ProfileImageSource[];
    png: ProfileImageSource[];
  };
  alt: string;
  width: number;
  height: number;
}

export interface RichTextRun {
  text: string;
  emphasis?: boolean;
  link?: string;
}

export type ProfileActionVariant =
  | "primary"
  | "secondary";

export interface ProfileAction {
  id: string;
  label: string;
  href: string;
  variant: ProfileActionVariant;
  download?: boolean;
}

export interface ProfileMetric {
  id: string;
  value: string;
  label: string;
}

export interface Profile extends Metadata {
  name: string;
  eyebrow: string;
  headline: string;
  summary: RichTextRun[];
  location?: string;
  email?: string;
  avatar?: ProfileAvatar;
  actions: ProfileAction[];
  metrics: ProfileMetric[];
  socials: SocialLink[];
}
