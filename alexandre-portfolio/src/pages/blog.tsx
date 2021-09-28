// src/pages/blog.tsx
import {graphql, useStaticQuery} from "gatsby";
import * as React from "react";
import Cards from "../component/Cards";
import Layout from "../component/Layout";
import PostCard from "../component/PostCard";

const BlogPage: React.FC = () => {
  const {allMarkdownRemark} = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
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
    }
  `);
  return (
    <Layout>
      <h1>Blog</h1>
      <Cards>
        {allMarkdownRemark.edges.map(({node}) => (
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

export default BlogPage;
