import { Link } from "gatsby-plugin-react-i18next";
import * as React from "react";
import Card from "./Card";
// @ts-ignore
import * as styles from "./PostCard.module.scss";
import Tags from "./Tags";

interface Props {
  slug: string;
  title: string;
  date: string;
  tags: Array<string>;
  onTagClick?: (tag: string) => void;
}

const PostCard: React.FC<Props> = (props) => {
  const linkUrl = `/${props.slug}`;

  const date = props.date.split(" ")[0];

  return (
    <Link to={linkUrl}>
      <Card className={styles.postCard}>
        <div>
          <Tags tags={props.tags} onTagClick={(tag) => props.onTagClick !== undefined && props.onTagClick(tag)} />
        </div>
        <p className={styles.title}>{props.title}</p>
        <p className={styles.information}>{date}</p>
      </Card>
    </Link>
  );
};

export default PostCard;
