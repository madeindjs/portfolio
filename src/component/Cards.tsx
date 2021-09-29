import * as React from "react";
// @ts-ignore
import * as styles from "./Cards.module.scss";

const Cards: React.FC = ({children}) => {
  return <div className={styles.cards}>{children}</div>;
};

export default Cards;
