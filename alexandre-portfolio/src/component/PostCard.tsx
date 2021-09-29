import AniLink from "gatsby-plugin-transition-link/AniLink";
import * as React from "react";
import Card from "./Card";
// @ts-ignore
import * as styles from "./PostCard.module.scss";

interface Props {
  slug: string;
  title: string;
  date: string;
  tags: Array<string>;
  onTagClick: (tag: string) => void;
}

const PostCard: React.FC<Props> = (props) => {
  const linkUrl = `/posts/${props.slug}`;

  const date = props.date.split(" ")[0];

  return (
    <AniLink cover to={linkUrl} duration={0.6} bg="black">
      <Card className={styles.postCard}>
        <div>
          <ul className={styles.tags}>
            {props.tags.map((tag) => (
              <li key={tag} onClick={() => props.onTagClick(tag)}>
                {tag}
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.title}>{props.title}</p>
        <p className={styles.information}>{date}</p>
      </Card>
    </AniLink>
  );
};

export default PostCard;
