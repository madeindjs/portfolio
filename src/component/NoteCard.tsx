import AniLink from "gatsby-plugin-transition-link/AniLink";
import * as React from "react";
import Card from "./Card";
// @ts-ignore
import * as styles from "./NoteCard.module.scss";

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
        <div className={styles.title}>
          <ul>
            {props.slug.split(".").map((word, i) => (
              <li key={i}>{word}</li>
            ))}
          </ul>
        </div>
      </Card>
    </AniLink>
  );
};

export default NoteCard;
