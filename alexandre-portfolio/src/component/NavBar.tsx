import {Link} from "gatsby";
import React from "react";
// @ts-ignore
import * as styles from "./NavBar.module.scss";

const NavBar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <Link to="/" title="Alexandre ROUSSEAU" className={styles.brand}>
        <span>AR</span>
      </Link>
      <Link to="/blog">Blog</Link>
      <Link to="/books">Books</Link>
      {/* {% if site.lang == 'fr' %}
  <a href="/en/">🇬🇧</a>
  {% elsif site.lang == 'en' %}
  <a href="/">🇫🇷</a>
  {% endif %} */}
    </nav>
  );
};

export default NavBar;
