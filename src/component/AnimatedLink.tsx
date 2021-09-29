import {GatsbyLinkProps} from "gatsby";
import AniLink from "gatsby-plugin-transition-link/AniLink";
import React from "react";

const AnimatedLink: React.FC<GatsbyLinkProps<{}>> = (props) => {
  return (
    <AniLink cover {...props} duration={0.6} bg="black">
      {props.children}
    </AniLink>
  );
};

export default AnimatedLink;
