import {
  faGithub,
  faLinkedin,
  faStackOverflow,
} from "@fortawesome/free-brands-svg-icons";
import {faEnvelope} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Link} from "gatsby";
import {useI18next} from "gatsby-plugin-react-i18next";
import React from "react";
// @ts-ignore
import * as styles from "./Footer.module.scss";

const Footer: React.FC = () => {
  const {t} = useI18next("footer");
  return (
    <footer className={styles.footer}>
      <div className={styles.terms}>
        <p dangerouslySetInnerHTML={{__html: t("poweredByGatsby")}}></p>
        <p dangerouslySetInnerHTML={{__html: t("licence")}}></p>
        <p dangerouslySetInnerHTML={{__html: t("cookie")}}></p>
      </div>
      <div className={styles.externalsLinks}>
        <Link to="https://stackoverflow.com/users/5935198/rousseaualexandre">
          <FontAwesomeIcon icon={faStackOverflow} />
        </Link>
        <Link to="https://github.com/madeindjs">
          <FontAwesomeIcon icon={faGithub} />
        </Link>
        <Link to="https://www.linkedin.com/in/alexandre-rousseau-a55a9464/">
          <FontAwesomeIcon icon={faLinkedin} />
        </Link>
        <Link to="mailto:alexandre@rsseau.fr">
          <FontAwesomeIcon icon={faEnvelope} />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
