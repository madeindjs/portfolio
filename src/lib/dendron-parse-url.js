const popups = {};
const posts = data.allMdx.nodes;
posts.map((post) => {
  if (post) {
    popups[`${post.slug.substring(post.slug.lastIndexOf("/") + 1)}`] = {
      title: post.frontmatter.title,
      body: post.body,
      slug: post.frontmatter.slug,
      dendronId: post.frontmatter.id,
      published: post.frontmatter.published,
    };
  }
});
