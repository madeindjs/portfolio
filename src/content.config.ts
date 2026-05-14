import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Transform string to Date object
    date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    tags: z
      .array(z.string())
      .optional()
      .transform((arr) => arr ?? []),
    heroImage: z.string().optional(),
    translations: z
      .object({
        fr: z.string().optional(),
        en: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { blog };
