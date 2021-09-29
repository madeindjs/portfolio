import React, {CSSProperties} from "react";
import Footer from "./Footer";
// @ts-ignore
import * as styles from "./Layout.module.scss";
import NavBar from "./NavBar";

interface Props {
  layoutStyle?: CSSProperties;
}

const Layout: React.FC<Props> = (props) => {
  return (
    <>
      <header>
        <NavBar />
      </header>
      <div className={styles.layout} style={props.layoutStyle}>
        <main className={styles.grid}>{props.children}</main>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
