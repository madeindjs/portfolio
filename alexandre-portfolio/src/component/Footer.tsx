import {useI18next} from "gatsby-plugin-react-i18next";
import React from "react";
// @ts-ignore
import * as styles from "./Footer.module.scss";

const Footer: React.FC = () => {
  const {t} = useI18next("footer");
  return (
    <footer className={styles.footer}>
      {/* <div className={styles.sitemap}>
        <ul>
          <li>
            <Link to="/">
              <Trans>home</Trans>
            </Link>
          </li>
          <li>
            <Link to="/blog">
              <Trans>blog</Trans>
            </Link>
          </li>
          <li>
            <Link to="/books">
              <Trans>books</Trans>
            </Link>
          </li>
        </ul>
      </div> */}
      <div className={styles.terms}>
        <p dangerouslySetInnerHTML={{__html: t("poweredByGatsby")}}></p>
        <p dangerouslySetInnerHTML={{__html: t("licence")}}></p>
        <p dangerouslySetInnerHTML={{__html: t("cookie")}}></p>
      </div>
      <div className={styles.externalsLinks}>
        <p dangerouslySetInnerHTML={{__html: t("poweredByGatsby")}}></p>
        <p dangerouslySetInnerHTML={{__html: t("licence")}}></p>
      </div>
    </footer>
  );
};

export default Footer;
