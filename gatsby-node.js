// gatsby-node.js
const path = require("path");

module.exports.onCreateNode = ({node, actions, reporter}) => {
  const {createNodeField} = actions;

  if (node.internal.type === "MarkdownRemark") {
    const slug = path.basename(node.fileAbsolutePath, ".md");

    console.log(slug);

    if (slug === undefined) {
      reporter.panicOnBuild(
        `🚨  ERROR: Cannot load slug for ${node.fileAbsolutePath}`
      );
    }

    createNodeField({
      node,
      name: "slug",
      value: slug,
    });
  }
};

exports.createPages = async ({graphql, actions, reporter}) => {
  const {createPage} = actions;

  const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query');
  }

  // Create blog post pages.
  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach(({node}, index) => {
    createPage({
      path: `/posts/${node.fields.slug}`,
      component: path.resolve(`./src/component/PostPageTemplate.tsx`),
      context: {slug: node.fields.slug},
    });
  });
};
