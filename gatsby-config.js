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
    {
      resolve: "gatsby-plugin-htaccess",
      options: {
        custom: `
            Redirect permanent /benchmarking/2018/11/12/benchmark-templates.html /2018-11-12-benchmark-templates
            Redirect permanent /blog/page/2/ /blog
            Redirect gone /books/api_on_rails_5-en.html
            Redirect gone /books/api_on_rails_6-en.html
            Redirect gone /books/api_on_rails_6-es.html
            Redirect gone /books/api_on_rails_6-fr.html
            Redirect gone /books/rest-api-ts_en.html
            Redirect gone /books/rest-api-ts_fr.html
            Redirect permanent /development/2017/09/22/afficher-les-erreurs-d-un-formulaire-en-ajx-avec-twitter-bootstrap-et-rails /2017-10-05-afficher-les-erreurs-d-un-formulaire-en-ajax-avec-twitter-bootstrap-et-rails
            Redirect permanent /development/2017/09/22/Afficher-les-erreurs-d-un-formulaire-en-AJX-avec-Twitter-Bootstrap-et-Rails.html /2017-10-05-afficher-les-erreurs-d-un-formulaire-en-ajax-avec-twitter-bootstrap-et-rails
            Redirect permanent /development/2017/09/22/migrer-une-application-rails-vers-mariadb /2017-10-04-migrer-une-application-rails-vers-mariadb
            Redirect permanent /devops/2019/11/06/go-access.html /2019-11-07-lire-les-logs-avec-go-acces
            Redirect permanent /devops/2020/03/01/netlify-clone-with-raspberry.html /2020-03-01-reproduire-netlify-avec-un-raspberry
            Redirect permanent /devops/2020/03/02/automatic-report-with-goaccess.html /2020-03-02-rapport-automatique-avec-goaccess
            Redirect permanent /devops/2021/06/05/docker-postgres-replication.html /2021-06-05-mise-en-place-postgres-replication-avec-docker
            Redirect permanent /en/ /
            Redirect permanent /en/blog/ /blog
            Redirect permanent /en/hacking/2020/08/06/hack-password-wpa-wifi.html /2020-08-06-hack-password-wpa-wifi
            Redirect permanent /en/organization/2020/10/13/daily-stand-up-md.html /2020-10-13-daily-stand-up-md
            Redirect permanent /en/programming/2019/06/19/express-typescript.html /2019-06-20-express-typescript
            Redirect permanent /en/programming/2020/08/05/gcloud-deploy-with-gitlabci.html /2020-08-05-gcloud-deploy-with-gitlabci
            Redirect permanent /en/programming/2020/10/28/google-oauth.html /2020-10-28-google-oauth
            Redirect permanent /en/programming/2021/06/05/setup-typeorm-and-inversify.html /2021-06-10-mise-en-place-typeorm-et-inversify
            Redirect permanent /en/story/2019/11/10/api-on-rails.html /2019-11-11-api-on-rails
            Redirect permanent /en/tag/(.*).html /blog?q=$1
            Redirect permanent /en/tutorial/2018/12/03/zip-active-storage.html /2018-12-03-zip-active-storage-en
            Redirect permanent /en/tutorial/2019/02/02/stripe.html /2019-02-04-stripe-en
            Redirect permanent /en/webmaster/2020/10/15/change-domain-without-kill-seo.html /2020-10-15-changer-de-domain-sans-tuer-le-seo
            Redirect gone /fonts/
            Redirect permanent /hacking/2017/10/31/hacker-password-wpa-wifi.html /2017-10-31-hacker-password-wpa-wifi
            Redirect permanent /network/2017/10/11/installer_bridge_sfr_box-4k /2017-10-11-installer-bridge-sfr-box-4k
            Redirect permanent /network/2017/10/11/Installer_bridge_sfr_box-4k.html /2017-10-11-installer-bridge-sfr-box-4k
            Redirect permanent /network/2017/10/14/reverse_proxy_apache /2017-10-14-reverse-proxy-apache
            Redirect permanent /network/2017/10/15/comparaison_server_apache_ruby_rpi2_vs_rp3 /2017-10-15-comparaison-server-apache-ruby-rpi2-vs-rp3
            Redirect permanent /organization/2020/10/13/daily-stand-up-md.html /2020-10-13-daily-stand-up-avec-markdown
            Redirect permanent /programming/2017/09/19/mettre-a-jour-un-package-sur-pipy.html /2017-09-19-mettre-a-jour-un-package-sur-pipy
            Redirect permanent /programming/2017/09/20/vérifier-la-syntaxe-php-a-chaque-commit.html /2017-09-20-vérifier-la-syntaxe-php-a-chaque-commit
            Redirect permanent /programming/2019/06/19/express-typescript.html /2019-06-20-mise-en-place-express-typescript
            Redirect permanent /programming/2020/05/04/typescript-generator.html /2020-05-05-typescript-generateur
            Redirect permanent /programming/2020/08/05/gcloud-deploy-with-gitlabci.html /2020-08-05-deployer-sur-gcloud-deploy-avec-gitlabci
            Redirect permanent /programming/2020/10/28/google-oauth.html /2020-10-28-authentification-google-oauth
            Redirect permanent /programming/2021/06/10/mise-en-place-typeorm-et-inversify.html /2021-06-05-setup-typeorm-and-inversify
            Redirect gone /resume/
            Redirect permanent /resume/alexandre-rousseau.pdf /alexandre-rousseau.pdf
            Redirect gone /resume/complete
            Redirect gone /resume/complete.html
            Redirect gone /resume/partial
            Redirect gone /resume/partial-en
            Redirect permanent /story/2019/11/10/api-on-rails.html /2019-11-11-retour-experience-api-on-rails
            Redirect permanent /tag/(.*).html /blog?q=$1
            Redirect permanent /tutorial/2017/11/16/installer-apache.html /2017-11-16-installer-apache
            Redirect permanent /tutorial/2017/11/28/rust.html /2017-11-28-rust
            Redirect permanent /tutorial/2018/02/07/rust-web-spider-crate.html /2018-02-07-rust-web-spider-crate
            Redirect permanent /tutorial/2018/04/03/optimiser-apache.html /2018-04-03-optimiser-apache
            Redirect permanent /tutorial/2018/04/06/rust-threaded-crawler.html /2018-04-06-rust-threaded-crawler
            Redirect permanent /tutorial/2018/06/20/new-symfony-project-with-vagrant.html /2018-06-20-new-symfony-project-with-vagrant
            Redirect permanent /tutorial/2018/06/22/kill-rails-n1-queries.html /2018-06-22-kill-rails-n1-querie
            Redirect permanent /tutorial/2018/08/03/setup-phinx.html /2018-08-03-setup-phinx
            Redirect permanent /tutorial/2018/08/28/syncthing.html /2018-08-28-syncthing
            Redirect permanent /tutorial/2018/10/02/kvm.html /2018-10-02-kvm
            Redirect permanent /tutorial/2018/10/10/gateway.html /2018-10-10-gateway
            Redirect permanent /tutorial/2018/12/03/zip-active-storage.html /2018-12-03-zip-active-storage
            Redirect permanent /tutorial/2019/02/02/stripe.html /2019-02-04-mise-en-place-stripe
            Redirect permanent /webmaster/2020/10/15/change-domain-without-kill-seo.html /2020-10-15-changer-de-domain-sans-tuer-le-seo
        `,
      },
    },
    {
      resolve: `gatsby-plugin-react-css-modules`,
      options: {
        filetypes: {
          ".scss": {syntax: `postcss-scss`},
        },
        exclude: `\/global\/`,
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/me.png",
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
        path: `${__dirname}/content/posts`,
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
            title: "Alexandre's website",
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
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
              showCaptions: true,
              markdownCaptions: true,
              backgroundColor: "transparent",
            },
          },
        ],
      },
    },
  ],
};
