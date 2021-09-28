import {Link} from "gatsby";
import {Trans} from "gatsby-plugin-react-i18next";
import * as React from "react";
import Card from "./Card";
import FlipCard from "./FlipCard";
// @ts-ignore
import * as styles from "./PostCard.module.scss";

interface Props {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: Array<string>;
  onTagClick: (tag: string) => void;
}

const PostCard: React.FC<Props> = (props) => {
  const linkUrl = `/posts/${props.slug}`;
  return (
    <Card className={styles.postCard}>
      <p className={styles.title}>
        <Link to={linkUrl}>{props.title}</Link>
      </p>
      <div>
        <ul className={styles.tags}>
          {props.tags.map((tag) => (
            <li onClick={() => props.onTagClick(tag)}>{tag}</li>
          ))}
        </ul>
      </div>
      <p className={styles.postCardBack}>{props.excerpt}</p>
      <div className="actions">
        <Link to={linkUrl} className={styles.button}>
          <Trans>read</Trans>
        </Link>
      </div>
    </Card>
  );
  return (
    <Link to={linkUrl} className={styles.postCard}>
      <FlipCard
        front={
          <div className={styles.postCardFront}>
            <p>{props.title}</p>
            <ul className={styles.tags}>
              {props.tags.map((tag) => (
                <li>{tag}</li>
              ))}
            </ul>
          </div>
        }
        back={<p className={styles.postCardBack}>{props.excerpt}</p>}
      />
    </Link>
  );
};

export default PostCard;
