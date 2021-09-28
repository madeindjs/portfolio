import * as React from "react";
import Avatar from "../component/Avatar";
import Layout from "../component/Layout";

// markup
const IndexPage: React.FC = () => {
  return (
    <Layout>
      <section>
        <Avatar></Avatar>

        <h1>Alexandre Rousseau</h1>
        <p>TODO use translation</p>
      </section>
    </Layout>
  );
};

export default IndexPage;
