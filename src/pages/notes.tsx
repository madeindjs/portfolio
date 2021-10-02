// src/pages/blog.tsx
import { graphql } from "gatsby";
import { Trans, useI18next } from "gatsby-plugin-react-i18next";
import * as React from "react";
import { useState } from "react";
import Layout from "../component/Layout";
import Notes from "../component/Notes";
import SEO from "../component/SEO";
import { Post } from "../interfaces/post.interface";
// @ts-ignore
import * as styles from "./blog.module.scss";

interface Props {
  data: { posts: { edges: { node: Post }[] } };
}

const BlogPage: React.FC<Props> = ({ data }) => {
  const allPosts = data.posts.edges;
  const { t } = useI18next("notes");

  const emptyQuery = "";

  const [state, setState] = useState({
    filteredData: [],
    query: emptyQuery,
    maxPost: 10,
  });

  const displayMore = () => setState({ ...state, maxPost: state.maxPost + 10 });

  const handleInputChange = (query: string) => {
    const posts = data.posts.edges || [];

    const filteredData = posts.filter((post) => {
      const { title, tags } = post.node.frontmatter;
      return (
        title.toLowerCase().includes(query.toLowerCase()) ||
        (tags && tags.join("").toLowerCase().includes(query.toLowerCase()))
      );
    });

    setState({ query, filteredData, maxPost: state.maxPost });
  };

  const { filteredData, query } = state;
  const hasSearchResults = filteredData && query !== emptyQuery;
  const notes: Array<{ node: Post }> = hasSearchResults ? filteredData : allPosts;

  return (
    <Layout>
      <SEO title={t("notes")} />
      <h1>
        <Trans>notes</Trans>
      </h1>
      <p>
        <Trans ns="notes">lead</Trans>
      </p>
      <input
        type="text"
        aria-label="Search"
        placeholder={t("searchPlaceholder")}
        onChange={(event) => handleInputChange(event.target.value)}
        className={styles.search}
        value={state.query}
      />
      <Notes notes={notes.slice(0, state.maxPost).map(({ node }) => node)} />

      {notes.length > state.maxPost && (
        <button className="btn" onClick={() => displayMore()}>
          <Trans>displayMore</Trans>
        </button>
      )}
    </Layout>
  );
};

export const query = graphql`
  query ($language: String!) {
    posts: allMarkdownRemark(
      filter: { frontmatter: { lang: { eq: $language }, public: { eq: true } }, fields: { type: { eq: "note" } } }
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
    ) {
      edges {
        node {
          frontmatter {
            title
            date
            tags
          }
          fields {
            slug
            type
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

export default BlogPage;
