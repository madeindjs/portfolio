import { defineCollection, z } from "astro:content";

const blog = defineCollection({
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
