import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("blog");

  const content = await rss({
    title: "Alexandre Rousseau",
    description: "The blog of another developper who speaks about technologies and other stuffs.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,

      link: `/blog/${post.slug}/`,
    })),
  });

  return new Response(content);
}
