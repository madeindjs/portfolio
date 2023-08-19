import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import type { Langages } from "./i18n/ui";

export type Post = CollectionEntry<"blog">;

export type Project = {
  title: string;
  description: Record<Langages, string>;
  url?: string;
  github?: string;
  githubStars?: number;
  topics: string[];
  image?: ImageMetadata;
};
