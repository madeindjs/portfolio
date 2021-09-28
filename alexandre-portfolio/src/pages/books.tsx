import {graphql} from "gatsby";
import {StaticImage} from "gatsby-plugin-image";
import {Trans, useI18next} from "gatsby-plugin-react-i18next";
import * as React from "react";
import Layout from "../component/Layout";
// @ts-ignore
import * as styles from "./books.module.scss";

// markup
const BooksPage = () => {
  const {t, i18n} = useI18next();
  const isFr = i18n.language === "fr";
  const isEn = i18n.language === "en";
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
          <p>
            <Trans>api-on-rails-description</Trans>
          </p>
          <div className="action">
            <a href="https://github.com/madeindjs/api_on_rails" className="btn">
              Github
            </a>
            <a href="https://github.com/madeindjs/api_on_rails" className="btn">
              <Trans>buyOnLeanpub</Trans>
            </a>
          </div>
        </section>
        <section className={styles.book}>
          <h2>REST-API.ts</h2>
          <StaticImage
            src="../images/books/rest-api-ts.svg"
            alt={t("rest-api-ts-alt")}
            height={526}
            width={372}
          ></StaticImage>
          <p>
            <Trans>rest-api-ts-description</Trans>
          </p>
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
