import * as React from "react";
import Avatar from "../component/Avatar";
import Layout from "../component/Layout";

// markup
const IndexPage = () => {
  return (
    <Layout>
      <h1>Index</h1>

      <section class="main lead">
        <Avatar></Avatar>

        <h1 class="hide">Alexandre Rousseau</h1>
        <p></p>
      </section>
    </Layout>
  );
};

export default IndexPage;
