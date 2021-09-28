import {graphql} from "gatsby";
import {Trans, useI18next} from "gatsby-plugin-react-i18next";
import * as React from "react";
import Avatar from "../component/Avatar";
import Layout from "../component/Layout";

// markup
const IndexPage: React.FC = () => {
  const {t} = useI18next("home");
  return (
    <Layout>
      <section>
        <Avatar></Avatar>

        <h1>Alexandre Rousseau</h1>
        <p>
          <Trans>lead</Trans>
        </p>
        <p dangerouslySetInnerHTML={{__html: t("description")}}></p>
        <p dangerouslySetInnerHTML={{__html: t("bookDescription")}}></p>
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
