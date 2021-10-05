// gatsby-node.js
const path = require("path");

module.exports.onCreateNode = ({node, actions, reporter}) => {
  const {createNodeField} = actions;

  if (node.internal.type === "MarkdownRemark") {
    const slug = path.basename(node.fileAbsolutePath, ".md");

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

function checkNodeSEO(node, reporter) {
  const warn = (message) =>
    reporter.warn(`createPages "/${node.fields.slug}" - ${message}`);

  if (node.frontmatter.title.length > 60) {
    warn(`have a too long title`);
  }

  if (typeof node.frontmatter.description !== "string") {
    warn(`have not description`);
  } else if (node.frontmatter.description.length > 160) {
    warn(`have a too long description`);
  }
}

exports.createPages = async ({graphql, actions, reporter}) => {
  const {createPage} = actions;

  const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            id
            frontmatter {
              title
              description
            }
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
    //
    reporter.info(`createPages "/${node.fields.slug}"`);
    checkNodeSEO(node, reporter);

    createPage({
      path: `/${node.fields.slug}`,
      component: path.resolve(`./src/component/PostPageTemplate.tsx`),
      context: {slug: node.fields.slug},
    });
  });
};
