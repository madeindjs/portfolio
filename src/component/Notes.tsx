import React from "react";
import { Post } from "../interfaces/post.interface";
import Cards from "./Cards";
import NoteCard from "./NoteCard";

interface Props {
  notes: Post[];
}

const Notes: React.FC<Props> = ({ notes }) => {
  return (
    <Cards>
      {notes.map((post) => (
        <NoteCard
          key={post.fields.slug}
          tags={post.frontmatter.tags}
          slug={post.fields.slug}
          title={post.frontmatter.title}
          date={post.frontmatter.date}
        />
      ))}
    </Cards>
  );
};

export default Notes;
