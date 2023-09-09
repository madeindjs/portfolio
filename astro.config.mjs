import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
  redirects: {
    "/": "/en.html",
    "/blog": "/en/blog.html",
    "/books": "/en/books.html",
    "/resume": "/en/resume.html",
  },
  markdown: {
    remarkPlugins: [remarkToc],
  },
});
