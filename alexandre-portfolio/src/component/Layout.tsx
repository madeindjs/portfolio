import React from "react";
// @ts-ignore
import * as styles from "./Layout.module.scss";
import NavBar from "./NavBar";

const Layout: React.FC = (props) => {
  return (
    <>
      <header>
        <NavBar></NavBar>
      </header>
      <main className={styles.layout}>{props.children}</main>
    </>
  );
};

export default Layout;
