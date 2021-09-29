import * as React from "react";
// @ts-ignore
import * as styles from "./Card.module.scss";

interface Props {
  className?: string;
}

const Card: React.FC<Props> = ({children, className}) => {
  let styleCard = styles.card;
  if (className) {
    styleCard += ` ${className}`;
  }
  return <div className={styleCard}>{children}</div>;
};

export default Card;
