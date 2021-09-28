import {Trans} from "gatsby-plugin-react-i18next";
import AniLink from "gatsby-plugin-transition-link/AniLink";
import * as React from "react";
import Card from "./Card";
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
        <AniLink paintDrip to={linkUrl}>
          {props.title}
        </AniLink>
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
        <AniLink paintDrip to={linkUrl} className={styles.button}>
          <Trans>read</Trans>
        </AniLink>
      </div>
    </Card>
  );
};

export default PostCard;
