import React from "react";
import Footer from "./Footer";
// @ts-ignore
import * as styles from "./Layout.module.scss";
import NavBar from "./NavBar";

const Layout: React.FC = ({ children }) => {
  return (
    <div className={styles.layout}>
      <header>
        <NavBar />
      </header>
      <main className={styles.grid}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
