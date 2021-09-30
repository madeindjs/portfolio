import React from "react";
// @ts-ignore
import * as styles from "./Tags.module.scss";

interface Props {
  tags: string[];
  onTagClick?: (tags: string) => void;
}

const Tags: React.FC<Props> = ({tags, onTagClick}) => {
  return (
    <ul className={styles.tags}>
      {tags.sort().map((tag) => (
        <li
          key={tag}
          onClick={() => onTagClick !== undefined && onTagClick(tag)}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
};

export default Tags;
