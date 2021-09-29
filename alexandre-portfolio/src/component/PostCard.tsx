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
        <AniLink cover to={linkUrl} duration={0.6} bg="black">
          {props.title}
        </AniLink>
      </p>
      <div>
        <ul className={styles.tags}>
          {props.tags.map((tag) => (
            <li key={tag} onClick={() => props.onTagClick(tag)}>
              {tag}
            </li>
          ))}
        </ul>
      </div>
      <p>{props.excerpt}</p>
      <div className="actions">
        <AniLink
          paintDrip
          to={linkUrl}
          className={styles.button}
          duration={0.5}
        >
          <Trans>read</Trans>
        </AniLink>
      </div>
    </Card>
  );
};

export default PostCard;
