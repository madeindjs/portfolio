import {graphql} from "gatsby";
import {Trans} from "gatsby-plugin-react-i18next";
import * as React from "react";
import BookCard from "../component/BookCard";
import Cards from "../component/Cards";
import Layout from "../component/Layout";

// markup
const BooksPage = () => {
  return (
    <Layout>
      <h1>
        <Trans>books</Trans>
      </h1>
      <Cards>
        <BookCard
          name="API on Rails"
          cover="../images/books/api-on-rails.svg"
          description={
            <>
              <p>
                Learn <strong>best practices</strong> to build an{" "}
                <strong>API</strong> using <strong>Ruby on Rails</strong> 5/6.
                The intention with this book it’s not only to teach you how to
                build an API with Rails. The purpose is also to teach you how to
                build <strong>scalable</strong> and{" "}
                <strong>maintainable</strong> API with Rails which means{" "}
                <strong>improve</strong> your current Rails knowledge.
              </p>
            </>
          }
        />
        <BookCard
          name="REST-API.ts"
          cover="../images/books/rest-api-ts.svg"
          description={
            <>
              <p>
                Learn <strong>best practices</strong> to build an{" "}
                <strong>API</strong> using <strong>Node.js / Typescript</strong>{" "}
                and following libraries:
              </p>

              <ul>
                <li>
                  <a href="https://nodejs.org/en/">Node.js</a> /{" "}
                  <a href="https://www.typescriptlang.org/">Typescript</a>
                </li>
                <li>
                  <a href="https://expressjs.com/">Express.js</a> as HTTP server
                </li>
                <li>
                  <a href="typeorm.io/">TypeORM</a> as ORM with{" "}
                  <a href="https://www.sqlite.org/index.html">
                    SQlite database
                  </a>{" "}
                  (but you can use Postgres or MySQL too)
                </li>
                <li>
                  Test Driven Development because I think this is a best way to
                  code
                </li>
              </ul>

              <p>
                The intention with this book it’s not only to teach you how to
                build an API. The purpose is also to teach you how to build{" "}
                <strong>scalable</strong> and <strong>maintainable</strong> API
                with Rails which means <strong>improve</strong> your current
                Rails knowledge.
              </p>
            </>
          }
        />
      </Cards>
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
