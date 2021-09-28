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
    <Link to={linkUrl} className={styles.postCard}>
      <FlipCard
        front={
          <div className={styles.postCardFront}>
            <p>{props.title}</p>
          </div>
        }
        back={<p className={styles.postCardBack}>{props.excerpt}</p>}
      />
    </Link>
  );
};

export default PostCard;
