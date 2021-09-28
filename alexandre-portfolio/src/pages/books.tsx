import {graphql} from "gatsby";
import {StaticImage} from "gatsby-plugin-image";
import {Trans, useI18next} from "gatsby-plugin-react-i18next";
import * as React from "react";
import Layout from "../component/Layout";
// @ts-ignore
import * as styles from "./books.module.scss";

// markup
const BooksPage = () => {
  const {t} = useI18next();
  return (
    <Layout>
      <h1>
        <Trans>books</Trans>
      </h1>
      <p dangerouslySetInnerHTML={{__html: t("bookDescription")}}></p>
      <div className={styles.books}>
        <section className={styles.book}>
          <h2>API On Rails</h2>
          <StaticImage
            src="../images/books/api-on-rails.svg"
            alt={t("api-on-rails-alt")}
            height={526}
            width={372}
          ></StaticImage>
          <p>{t("api-on-rails-description")}</p>
        </section>
        <section className={styles.book}>
          <h2>REST-API.ts</h2>
          <StaticImage
            src="../images/books/rest-api-ts.svg"
            alt={t("rest-api-ts-alt")}
            height={526}
            width={372}
          ></StaticImage>
          <p>{t("rest-api-ts-description")}</p>
        </section>
      </div>
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

export default BooksPage;
