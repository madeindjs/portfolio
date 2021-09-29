import {graphql} from "gatsby";
import {Trans, useI18next} from "gatsby-plugin-react-i18next";
import * as React from "react";
import AnimatedLink from "../component/AnimatedLink";
import Avatar from "../component/Avatar";
import Layout from "../component/Layout";
import SEO from "../component/SEO";
// @ts-ignore
import * as styles from "./index.module.scss";

// markup
const IndexPage: React.FC = () => {
  const {t} = useI18next("home");
  return (
    <Layout layoutStyle={{display: "flex"}}>
      <SEO />
      <section className={styles.section}>
        <div>
          <Avatar></Avatar>
        </div>

        <h1>
          <Trans>lead</Trans>
        </h1>
        <p dangerouslySetInnerHTML={{__html: t("description")}}></p>

        <div className={styles.actions}>
          <AnimatedLink className="btn" to="/blog">
            <Trans>readBlog</Trans>
          </AnimatedLink>

          <AnimatedLink className="btn" to="/blog">
            <Trans>readBooks</Trans>
          </AnimatedLink>
        </div>
      </section>
    </Layout>
  );
};
export const query = graphql`
  query ($language: String!) {
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

export default IndexPage;
