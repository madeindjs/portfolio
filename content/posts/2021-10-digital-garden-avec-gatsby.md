---
title: Créer un digital Garden avec Gatsby
description: Voici toutes les configuration VSCode que j'ai du faire pour configurer le deboggeur de VSCode avec Node.js
date: 2021-10-01 21:00:00 +0200
tags:
  - gatsby
  - markdown
lang: fr
image: ./images/dendron-graph.png
---

Le concept de [digital garden](https://joelhooks.com/digital-garden) est différent du blog. Le concept diffère car le Digital Garden consite à publier en l'état et non de chercher à publier un résultat finit. **Les notes évoluent constament alors que les articles sont destiné à être immuable**. Ce concept n'est pas nouveau, je n'invente rien: [il en existe beaucoup](https://wiki.dendron.so/notes/3a82c5ff-7945-46ae-8bf9-3b2275fc6642.html).

J'ai essayé plusieurs outils pour stoquer les notes. La totalité des outils que j'ai utilisé repose sur le format Markdown. Cela m'a permis de ne pas me bloquer à un outil et d'ainsi être libre de changer. Celui que j'utilise actuellement est [Dendron](https://dendron.so/), un outil de prise de note intégré à Visual Studio code. Cet outil est vraiment super et je stoque plus de 800 notes actuellement.

Vue que j'ai récement [migré mon site sous Gatsby](./2021-2021-09-30-migration-jekyll-gatsby.md), je me suis donc lancé dans cette expérience.

## Intégrer mes notes à Gatsby

La première étape est d'inclure mes notes à Gatsby. Mes notes sont sur un repository Git à part. Plutôt que de tout copier coller dans Gatsby, il est possible de d'utiliser les [sous-modules de Git](https://git-scm.com/book/en/v2/Git-Tools-Submodules). il suffit de se placer dans le repository de Gatsby et de faire pointer un dossier vers le repository contenant les notes:

```bash
git submodule add git@github.com:madeindjs/notes.git content/notes
```

Une fois que c'est fait, il faut dire à Gatsby de charger ce dossier:

```js
// gatsby-config.js

module.exports = {
  // ...
  plugins: [
    // ...
    // my posts
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/posts`,
        name: `posts`,
      },
    },
    // my dendron notes
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: "./content/notes/vault",
        name: `notes`,
      },
    },
    // markdown configuration
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        // ...
      },
    },
  ],
};
```

Et la j'arrive à la première erreur:

> Cannot query field "title" on type "MarkdownRemarkFrontmatter".

En effet la requête GraphQL pour récupérer les articles reposes sur tout le contenu Markdown qui inclue maintenant les notes Dendron. Le _front matter_ de mes articles est différents des notes Dendron.

- la définition de mes posts

```yml
title: Example un digital Garden avec Gatsby
description: Lorem ipsum
date: 2021-10-01 21:00:00 +0200
tags: [gatsby, markdown]
lang: fr
image: ./images/dendron-graph.png
```

- la définition des notes Dendron

```yml
id: BcrsHgkZ5inse0qdLSUi1
title: Example
desc: ""
updated: 1629893566599
created: 1629893558741
```

Nous allons donc essayer de faire cohabiter les deux en utilisant la méthode [`createSchemaCustomization`](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization) proposées dans la documentation:

```js
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
          type: "Date",
          resolve(source, args, context, info) {
            let {date} = source;

            if (date == null) {
              date = new Date(source.updated);
            } else if (typeof source.date === "number") {
              date = new Date(source.date);
            } else {
              return null;
            }

            return Number.isNaN(date.valueOf()) ? null : date;
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
```

Nous allons aussi faire la distinction entre les artiles et les notes. Nous pouvons ajouter un `field` aux données des fichier Markdown dans GraphQL:

```js
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
```

Il est maintenant possible de ne sélectionner que les articles par exemple:

```graphql
query MyQuery {
  allMarkdownRemark(filter: {fields: {type: {eq: "post"}}}) {
    edges {
      node {
        id
        fields {
          type
        }
      }
    }
  }
}
```

## Liens externes

- https://johackim.com/creer-un-digital-garden
- https://www.dschapman.com/articles/using-dendron-and-gatsby-together
