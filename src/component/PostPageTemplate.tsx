// src/component/PostPageTemplate.tsx
import { graphql } from "gatsby";
import Img from "gatsby-image";
import { Trans, useI18next } from "gatsby-plugin-react-i18next";
import * as React from "react";
import { Post } from "../interfaces/post.interface";
import Layout from "./Layout";
// @ts-ignore
import * as styles from "./PostPageTemplate.module.scss";
import Posts from "./Posts";
import SEO from "./SEO";
import Tags from "./Tags";

interface Props {
  data: { post: Post; posts: { edges: { node: Post }[] } };
}

const PostPageTemplate: React.FC<Props> = (props) => {
  const { t } = useI18next();

  const { post, posts } = props.data;
  const { tags, title, date, lang } = post.frontmatter;
  const image = post.frontmatter.image?.childImageSharp?.fluid;

  const dateFormatted = date.split(" ")[0];

  const relatedPosts = posts.edges
    .map((edge) => edge.node)
    .filter((p) => p.fields.slug !== post.fields.slug)
    .filter((p) => p.frontmatter.tags.some((t) => tags.includes(t)));

  let Promotions: JSX.Element[] = [];

  if (tags.some((tag) => ["javascript", "typescript", "node.js"].includes(tag))) {
    Promotions.push(<p className={styles.promotion} dangerouslySetInnerHTML={{ __html: t("promoteRestApiTs") }}></p>);
  } else if (tags.some((tag) => ["ruby", "rails"].includes(tag))) {
    Promotions.push(<p className={styles.promotion} dangerouslySetInnerHTML={{ __html: t("promoteApiOnRails") }}></p>);
  }

  return (
    <Layout>
      <SEO article={true} title={title} tags={tags} datePublished={date} dateModified={date} lang={lang} />
      <h1>{title}</h1>
      {image && <Img fluid={image} />}

      <Tags tags={tags} />
      <p>
        <Trans>publishedAt</Trans> {dateFormatted}
      </p>

      {Promotions}

      <article className={styles.article} dangerouslySetInnerHTML={{ __html: post.html }} />

      {relatedPosts.length > 0 && (
        <>
          <h2>
            <Trans>relatedPosts</Trans>
          </h2>
          <Posts posts={relatedPosts.slice(0, 3)} />
        </>
      )}
    </Layout>
  );
};

export const postQuery = graphql`
  query ($slug: String!, $language: String!) {
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields {
        slug
      }
      frontmatter {
        date
        title
        tags
        lang
        image {
          childImageSharp {
            fluid(maxWidth: 800) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
    posts: allMarkdownRemark(filter: { frontmatter: { lang: { eq: $language } } }) {
      edges {
        node {
          frontmatter {
            date
            title
            tags
          }
          fields {
            slug
          }
        }
      }
    }

    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
  }
`;

export default PostPageTemplate;
