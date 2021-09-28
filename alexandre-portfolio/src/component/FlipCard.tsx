import * as React from "react";
import Card from "./Card";
// @ts-ignore
import * as styles from "./FlipCard.module.scss";

interface Props {
  front: React.ReactElement;
  back: React.ReactElement;
}

const FlipCard: React.FC<Props> = ({front, back}) => {
  return (
    <div className={styles.flip}>
      <Card className={styles.flipFront}>{front}</Card>
      <Card className={styles.flipBack}>{back}</Card>
    </div>
  );
};

export default FlipCard;
