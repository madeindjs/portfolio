import React from "react";
import NavBar from "./NavBar";

const Layout: React.FC = (props) => {
  return (
    <>
      <header>
        <NavBar></NavBar>
      </header>
      <p>Layout</p>

      <main>{props.children}</main>
    </>
  );
};

export default Layout;
