import AniLink from "gatsby-plugin-transition-link/AniLink";
import * as React from "react";
import Card from "./Card";
// @ts-ignore
import * as styles from "./NoteCard.module.scss";
import Tags from "./Tags";

interface Props {
  slug: string;
  title: string;
  date: string;
  tags: Array<string>;
  onTagClick?: (tag: string) => void;
}

const NoteCard: React.FC<Props> = (props) => {
  const linkUrl = `/notes/${props.slug}`;

  const date = props.date?.split("T")[0] ?? "???";

  return (
    <AniLink cover to={linkUrl} duration={0.6} bg="black">
      <Card className={styles.postCard}>
        <div>
          <Tags tags={props.tags} onTagClick={(tag) => props.onTagClick !== undefined && props.onTagClick(tag)} />
        </div>
        <div className={styles.title}>
          <ul>
            {props.slug.split(".").map((word, i) => (
              <li key={i}>{word}</li>
            ))}
          </ul>
        </div>
        <p className={styles.information}>{date}</p>
      </Card>
    </AniLink>
  );
};

export default NoteCard;
