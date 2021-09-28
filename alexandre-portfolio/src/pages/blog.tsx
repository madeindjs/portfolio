// src/pages/blog.tsx
import {graphql} from "gatsby";
import {Trans} from "gatsby-plugin-react-i18next";
import * as React from "react";
import Cards from "../component/Cards";
import Layout from "../component/Layout";
import PostCard from "../component/PostCard";

const BlogPage: React.FC<{data: any}> = ({data}) => {
  return (
    <Layout>
      <h1>
        <Trans>blog</Trans>
      </h1>
      <Cards>
        {data.allMarkdownRemark.edges.map(({node}) => (
          <PostCard
            slug={node.fields.slug}
            title={node.frontmatter.title}
            excerpt={node.excerpt}
            date={node.frontmatter.date}
          />
        ))}
      </Cards>
    </Layout>
  );
};

export const query = graphql`
  query ($language: String!) {
    allMarkdownRemark(
      filter: {frontmatter: {lang: {eq: $language}}}
      sort: {order: DESC, fields: [frontmatter___date]}
      limit: 1000
    ) {
      edges {
        node {
          excerpt(pruneLength: 100)
          frontmatter {
            title
            date
            tags
          }
          fields {
            slug
          }
        }
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

export default BlogPage;
