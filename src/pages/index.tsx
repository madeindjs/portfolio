import { graphql } from "gatsby";
import { Link, Trans, useI18next } from "gatsby-plugin-react-i18next";
import * as React from "react";
import Avatar from "../component/Avatar";
import Layout from "../component/Layout";
import SEO from "../component/SEO";
// @ts-ignore
import * as styles from "./index.module.scss";

// markup
const IndexPage: React.FC = () => {
  const { t, language } = useI18next("home");
  return (
    <Layout>
      <SEO lang={language} />
      <section className={styles.section}>
        <div>
          <Avatar></Avatar>
        </div>

        <h1>
          <Trans>lead</Trans>
        </h1>
        <p dangerouslySetInnerHTML={{ __html: t("description") }}></p>

        <div className={styles.actions}>
          <Link className="btn" to="/blog">
            <Trans>readBlog</Trans>
          </Link>

          <Link className="btn" to="/blog">
            <Trans>readBooks</Trans>
          </Link>
        </div>
      </section>
    </Layout>
  );
};
export const query = graphql`
  query ($language: String!) {
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

export default IndexPage;
