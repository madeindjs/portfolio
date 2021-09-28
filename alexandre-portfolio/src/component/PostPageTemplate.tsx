// src/component/PostPageTemplate.tsx
import {graphql} from "gatsby";
import * as React from "react";
import Layout from "./Layout";

const PostPageTemplate: React.FC<{data: any}> = (props) => {
  const title = props.data.markdownRemark.frontmatter.title;
  const html = props.data.markdownRemark.html;
  return (
    <Layout>
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
