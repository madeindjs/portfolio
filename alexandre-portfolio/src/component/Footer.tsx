import {Link} from "gatsby";
import {Trans} from "gatsby-plugin-react-i18next";
import React from "react";
// @ts-ignore
import * as styles from "./Footer.module.scss";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <ul>
        <li>
          <Link to="/blog">
            <Trans>blog</Trans>
          </Link>
        </li>
        <li>
          <Link to="/books">
            <Trans>books</Trans>
          </Link>
        </li>
      </ul>
      <p></p>
    </footer>
  );
};

export default Footer;
