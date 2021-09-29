// src/component/PostPageTemplate.tsx
import {graphql} from "gatsby";
import * as React from "react";
import Layout from "./Layout";
import SEO from "./SEO";

const PostPageTemplate: React.FC<{data: any}> = (props) => {
  const title = props.data.markdownRemark.frontmatter.title;
  const tags = props.data.markdownRemark.frontmatter.tags;
  const date = props.data.markdownRemark.frontmatter.date;
  const html = props.data.markdownRemark.html;
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
      <article dangerouslySetInnerHTML={{__html: html}} />
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