// src/pages/blog.tsx
import {graphql} from "gatsby";
import {Trans} from "gatsby-plugin-react-i18next";
import * as React from "react";
import {useState} from "react";
import Cards from "../component/Cards";
import Layout from "../component/Layout";
import PostCard from "../component/PostCard";

const BlogPage: React.FC<{data: any}> = ({data}) => {
  const allPosts = data.allMarkdownRemark.edges;

  const emptyQuery = "";

  const [state, setState] = useState({
    filteredData: [],
    query: emptyQuery,
    maxPost: 10,
  });

  const displayMore = () => setState({...state, maxPost: state.maxPost + 10});

  const handleInputChange = (query: string) => {
    const posts = data.allMarkdownRemark.edges || [];

    const filteredData = posts.filter((post) => {
      const {title, tags} = post.node.frontmatter;
      return (
        title.toLowerCase().includes(query.toLowerCase()) ||
        (tags && tags.join("").toLowerCase().includes(query.toLowerCase()))
      );
    });

    setState({query, filteredData, maxPost: state.maxPost});
  };

  const {filteredData, query} = state;
  const hasSearchResults = filteredData && query !== emptyQuery;
  const posts: Array<any> = hasSearchResults ? filteredData : allPosts;

  return (
    <Layout>
      <h1>
        <Trans>blog</Trans>
      </h1>
      <input
        type="text"
        aria-label="Search"
        placeholder="Type to filter posts..."
        onChange={(event) => handleInputChange(event.target.value)}
        value={state.query}
      />
      <Cards>
        {posts.slice(0, state.maxPost).map(({node}) => (
          <PostCard
            onTagClick={(tag) => handleInputChange(tag)}
            tags={node.frontmatter.tags}
            slug={node.fields.slug}
            title={node.frontmatter.title}
            excerpt={node.excerpt}
            date={node.frontmatter.date}
          />
        ))}
      </Cards>
      {posts.length > state.maxPost && (
        <button onClick={() => displayMore()}>
          <Trans>displayMore</Trans>
        </button>
      )}
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
          excerpt(pruneLength: 200)
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
