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

    createNodeField({node, name: "slug", value: slug});

    const notesPath = path.join(__dirname, "content", "notes", "vault");
    const postsPath = path.join(__dirname, "content", "posts");

    let type = undefined;

    if (node.fileAbsolutePath.startsWith(notesPath)) {
      type = "note";
    } else if (node.fileAbsolutePath.startsWith(postsPath)) {
      type = "post";
    } else {
      reporter.panicOnBuild(
        `🚨  ERROR: Cannot define type of markdown for ${node.fileAbsolutePath}`
      );
    }

    createNodeField({node, name: "type", value: type});
  }
};

exports.createSchemaCustomization = ({actions, schema}) => {
  const {createTypes} = actions;
  const typeDefs = [
    "type MarkdownRemark implements Node @dontInfer { frontmatter: Frontmatter, fields: Fields }",
    schema.buildObjectType({
      name: "Fields",
      fields: {
        slug: {type: "String"},
        type: {type: "String"},
      },
    }),
    schema.buildObjectType({
      name: "Frontmatter",
      fields: {
        // fallback to updated if date not defined
        title: {type: "String"},
        image: {type: "File"},
        public: {type: "Boolean"},
        lang: {
          type: "String",
          resolve(source, args, context, info) {
            if (source.lang == null) {
              return "en";
            }
            return source.lang;
          },
        },
        date: {
          type: "String",
          resolve(source, args, context, info) {
            let {date} = source;

            if (typeof date === "string") {
              date = new Date(date);
            } else if (date == null) {
              date = new Date(source.updated);
            } else if (typeof date === "number") {
              date = new Date(date);
            } else {
              return null;
            }

            return Number.isNaN(date.valueOf()) ? null : date.toISOString();
          },
        },
        // add an empty array if tags not defined
        tags: {
          type: "[String!]",
          resolve(source, args, context, info) {
            if (source.tags == null) {
              return [];
            }
            return source.tags;
          },
        },
      },
    }),
  ];
  createTypes(typeDefs);
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
              type
            }
            frontmatter {
              public
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query');
  }

  const edges = result.data.allMarkdownRemark.edges;

  edges.forEach(({node}, index) => {
    if (node.fields.type === "post") {
      const uri = `/${node.fields.slug}`;

      createPage({
        path: uri,
        component: path.resolve(`./src/component/PostPageTemplate.tsx`),
        context: {slug: node.fields.slug},
      });
      reporter.info(`\tcreatePages POST ${uri}`);
    } else if (node.fields.type === "note" && node.frontmatter.public) {
      const uri = `/notes/${node.fields.slug}`;
      createPage({
        path: uri,
        component: path.resolve(`./src/component/NotePageTemplate.tsx`),
        context: {slug: node.fields.slug},
      });
      reporter.info(`\tcreatePages NOTE ${uri}`);
    }
  });
};
