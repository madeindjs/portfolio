import {graphql, useStaticQuery} from "gatsby";
import * as React from "react";
import Layout from "../component/Layout";

// markup
const BlogPage = () => {
  const {allMarkdownRemark, site} = useStaticQuery(graphql`
    query {
      allMarkdownRemark {
        edges {
          node {
            excerpt(pruneLength: 100)
            frontmatter {
              title
              date
            }
            id
          }
        }
      }
      site {
        siteMetadata {
          description
        }
      }
    }
  `);
  return (
    <Layout>
      <h1>Blog</h1>
      <ul>
        {allMarkdownRemark.edges.map(({node}) => (
          <li className="blog-post-item" key={node.id}>
            <h2>{node.frontmatter.title}</h2>
            <p>{node.excerpt}</p>
            <span className="published-at">
              Published at {node.frontmatter.date}
            </span>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default BlogPage;
