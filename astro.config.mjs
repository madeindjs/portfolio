import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  site: "https://rsseau.fr",
  integrations: [mdx(), sitemap()],
  redirects: {
    "/": "/en/",
    "/blog": "/en/blog/",
    "/books": "/en/books/",
    "/resume": "/en/resume/",
  },
  markdown: {
    remarkPlugins: [remarkToc],
  },
});
