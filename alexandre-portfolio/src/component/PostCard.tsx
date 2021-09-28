import {Link} from "gatsby";
import * as React from "react";
import FlipCard from "./FlipCard";
// @ts-ignore
import * as styles from "./PostCard.module.scss";

interface Props {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}

const PostCard: React.FC<Props> = (props) => {
  const linkUrl = `/posts/${props.slug}`;
  return (
    <Link to={linkUrl}>
      <FlipCard
        front={<p className={styles.postCardFront}>{props.title}</p>}
        back={<p className={styles.postCardBack}>{props.excerpt}</p>}
      />
    </Link>
  );
};

export default PostCard;
