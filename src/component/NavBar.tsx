import {Link, Trans, useI18next} from "gatsby-plugin-react-i18next";
import React from "react";
// @ts-ignore
import * as styles from "./NavBar.module.scss";

const LanguageSelector: React.FC = () => {
  const {changeLanguage, i18n} = useI18next();

  const isFr = i18n.language === "fr";
  const isEn = i18n.language === "en";

  return (
    <div>
      {isFr && (
        <button
          className={styles.language}
          onClick={() => changeLanguage("en")}
        >
          🇬🇧
        </button>
      )}
      {isEn && (
        <button
          className={styles.language}
          onClick={() => changeLanguage("fr")}
        >
          🇫🇷
        </button>
      )}
    </div>
  );
};

const NavBar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <Link to="/" title="Alexandre ROUSSEAU" className={styles.brand}>
        <span>AR</span>
      </Link>
      <Link to="/blog">
        <Trans>blog</Trans>
      </Link>
      <Link to="/books">
        <Trans>books</Trans>
      </Link>
      <Link to="/notes">
        <Trans>notes</Trans>
      </Link>
      <LanguageSelector></LanguageSelector>
    </nav>
  );
};

export default NavBar;
