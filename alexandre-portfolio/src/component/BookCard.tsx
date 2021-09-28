import * as React from "react";
// @ts-ignore
import * as styles from "./BookCard.module.scss";
import FlipCard from "./FlipCard";

interface Props {
  name: string;
  description: string | React.ReactElement;
  cover: string;
}

const BookCard: React.FC<Props> = (props) => {
  const frontStyle: React.CSSProperties = {
    backgroundImage: `url("${props.cover}")`,
  };
  return (
    <FlipCard
      front={
        <p className={styles.bookCardFront} style={frontStyle}>
          {props.name}
        </p>
      }
      back={
        <div className={styles.bookCardBack}>
          <div>{props.description}</div>
        </div>
      }
    />
  );
};

export default BookCard;
