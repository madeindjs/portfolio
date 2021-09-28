import React from "react";

const NavBar: React.FC = () => {
  return (
    <nav className="navbar">
      <a
        className="brand"
        href="{{ '/' | prepend: site.baseurl }}"
        title="Alexandre ROUSSEAU"
      >
        <span>AR</span>
      </a>
      <a href="{{ '/blog' | prepend: site.baseurl }}">Blog</a>
      <a href="/books">Books</a>
      {/* {% if site.lang == 'fr' %}
  <a href="/en/">🇬🇧</a>
  {% elsif site.lang == 'en' %}
  <a href="/">🇫🇷</a>
  {% endif %} */}
    </nav>
  );
};

export default NavBar;
