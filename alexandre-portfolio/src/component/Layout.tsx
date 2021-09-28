import React from "react";
import Footer from "./Footer";
// @ts-ignore
import * as styles from "./Layout.module.scss";
import NavBar from "./NavBar";

const Layout: React.FC = (props) => {
  return (
    <>
      <header>
        <NavBar />
      </header>
      <main className={styles.layout}>{props.children}</main>
      <Footer />
    </>
  );
};

export default Layout;
