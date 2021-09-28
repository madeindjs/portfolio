import * as React from "react";
import Card from "./Card";
// @ts-ignore
import * as styles from "./FlipCard.module.scss";

interface Props {
  front: React.ReactElement;
  back: React.ReactElement;
  className?: string;
}

const FlipCard: React.FC<Props> = ({front, back, className}) => {
  return (
    <div className={styles.flip}>
      <Card className={styles.flipFront + " " + className}>{front}</Card>
      <Card className={styles.flipBack + " " + className}>{back}</Card>
    </div>
  );
};

export default FlipCard;
