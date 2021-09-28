import * as React from "react";
import FlipCard from "./FlipCard";
// @ts-ignore
import * as styles from "./PostCard.module.scss";

interface Props {
  title: string;
  excerpt: string;
  date: string;
}

const PostCard: React.FC<Props> = (props) => {
  return (
    <FlipCard
      front={<p className={styles.postCardFront}>{props.title}</p>}
      back={<p className={styles.postCardBack}>{props.excerpt}</p>}
    />
  );
};

export default PostCard;
