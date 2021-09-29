// gatsby-config.js

module.exports = {
  siteMetadata: {
    siteUrl: "https://rsseau.fr",
    title: "Alexandre's portfolio",
    siteName: "Alexandre's website",
    logo: "https://rsseau.fr/favicon",
    description: "Blog about programming, devops and other interesting stuffs.",
    lang: "en",
    author: "Alexandre ROUSSEAU",
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-sitemap",
    "gatsby-plugin-typescript",
    "gatsby-plugin-sass",
    `gatsby-plugin-transition-link`,
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-react-css-modules`,
      options: {
        // *.css files are included by default.
        // To support another syntax (e.g. SCSS),
        // add `postcss-scss` to your project's devDependencies
        // and add the following option here:
        filetypes: {
          ".scss": {syntax: `postcss-scss`},
        },

        // Exclude global styles from the plugin using a RegExp:
        exclude: `\/global\/`,
        // For all the options check babel-plugin-react-css-modules README link provided above
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
    },
    "gatsby-transformer-remark",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/posts`,
        name: `posts`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/locales`,
        name: `locale`,
      },
    },
    {
      resolve: `gatsby-plugin-react-i18next`,
      options: {
        localeJsonSourceName: `locale`, // name given to `gatsby-source-filesystem` plugin.
        languages: [`en`, `fr`],
        defaultLanguage: `en`,

        i18nextOptions: {
          interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
          },
          keySeparator: false,
          nsSeparator: false,
        },
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({query: {site, allMarkdownRemark}}) => {
              return allMarkdownRemark.edges.map((edge) => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{"content:encoded": edge.node.html}],
                });
              });
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "Your Site's RSS Feed",
          },
        ],
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            // options: {
            //   // Class prefix for <pre> tags containing syntax highlighting;
            //   // defaults to 'language-' (e.g. <pre class="language-js">).
            //   // If your site loads Prism into the browser at runtime,
            //   // (e.g. for use with libraries like react-live),
            //   // you may use this to prevent Prism from re-processing syntax.
            //   // This is an uncommon use-case though;
            //   // If you're unsure, it's best to use the default value.
            //   classPrefix: "language-",
            //   // This is used to allow setting a language for inline code
            //   // (i.e. single backticks) by creating a separator.
            //   // This separator is a string and will do no white-space
            //   // stripping.
            //   // A suggested value for English speakers is the non-ascii
            //   // character '›'.
            //   inlineCodeMarker: null,
            //   // This lets you set up language aliases.  For example,
            //   // setting this to '{ sh: "bash" }' will let you use
            //   // the language "sh" which will highlight using the
            //   // bash highlighter.
            //   aliases: {},
            //   // This toggles the display of line numbers globally alongside the code.
            //   // To use it, add the following line in gatsby-browser.js
            //   // right after importing the prism color scheme:
            //   //  require("prismjs/plugins/line-numbers/prism-line-numbers.css")
            //   // Defaults to false.
            //   // If you wish to only show line numbers on certain code blocks,
            //   // leave false and use the {numberLines: true} syntax below
            //   showLineNumbers: false,
            //   // If setting this to true, the parser won't handle and highlight inline
            //   // code used in markdown i.e. single backtick code like `this`.
            //   noInlineHighlight: false,
            //   // This adds a new language definition to Prism or extend an already
            //   // existing language definition. More details on this option can be
            //   // found under the header "Add new language definition or extend an
            //   // existing language" below.
            //   languageExtensions: [
            //     {
            //       language: "superscript",
            //       extend: "javascript",
            //       definition: {
            //         superscript_types: /(SuperType)/,
            //       },
            //       insertBefore: {
            //         function: {
            //           superscript_keywords: /(superif|superelse)/,
            //         },
            //       },
            //     },
            //   ],
            //   // Customize the prompt used in shell output
            //   // Values below are default
            //   prompt: {
            //     user: "root",
            //     host: "localhost",
            //     global: false,
            //   },
            //   // By default the HTML entities <>&'" are escaped.
            //   // Add additional HTML escapes by providing a mapping
            //   // of HTML entities and their escape value IE: { '}': '&#123;' }
            // escapeEntities: {},
            // },
          },
        ],
      },
    },
  ],
};
