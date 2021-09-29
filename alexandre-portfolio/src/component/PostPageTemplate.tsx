// src/component/PostPageTemplate.tsx
import {graphql} from "gatsby";
import {Trans, useI18next} from "gatsby-plugin-react-i18next";
import * as React from "react";
import Layout from "./Layout";
// @ts-ignore
import * as styles from "./PostPageTemplate.module.scss";
import SEO from "./SEO";
import Tags from "./Tags";

const PostPageTemplate: React.FC<{data: any}> = (props) => {
  const title = props.data.markdownRemark.frontmatter.title;
  const tags = props.data.markdownRemark.frontmatter.tags;
  const date = props.data.markdownRemark.frontmatter.date;
  const html = props.data.markdownRemark.html;

  const {t} = useI18next();

  const dateFormatted = date.split(" ")[0];

  let Promotions = [];

  if (
    tags.some((tag) => ["javascript", "typescript", "node.js"].includes(tag))
  ) {
    Promotions.push(
      <p
        className={styles.promotion}
        dangerouslySetInnerHTML={{__html: t("promoteRestApiTs")}}
      ></p>
    );
  } else if (tags.some((tag) => ["ruby", "rails"].includes(tag))) {
    Promotions.push(
      <p
        className={styles.promotion}
        dangerouslySetInnerHTML={{__html: t("promoteApiOnRails")}}
      ></p>
    );
  }

  return (
    <Layout>
      <SEO
        article={true}
        title={title}
        tags={tags}
        datePublished={date}
        dateModified={date}
      />
      <h1>{title}</h1>

      <Tags tags={tags} />
      <p>
        <Trans>publishedAt</Trans> {dateFormatted}
      </p>

      {Promotions}

      <article
        className={styles.article}
        dangerouslySetInnerHTML={{__html: html}}
      />
    </Layout>
  );
};

export const postQuery = graphql`
  query ($slug: String!, $language: String!) {
    markdownRemark(fields: {slug: {eq: $slug}}) {
      html
      excerpt
      frontmatter {
        date
        title
        tags
      }
    }
    locales: allLocale(filter: {language: {eq: $language}}) {
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
