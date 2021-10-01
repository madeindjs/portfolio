import React from "react";
import {Post} from "../interfaces/post.interface";
import Cards from "./Cards";
import PostCard from "./PostCard";

interface Props {
  posts: Post[];
}

const Posts: React.FC<Props> = ({posts}) => {
  return (
    <Cards>
      {posts.map((post) => (
        <PostCard
          key={post.fields.slug}
          tags={post.frontmatter.tags}
          type={post.fields.type}
          slug={post.fields.slug}
          title={post.frontmatter.title}
          date={post.frontmatter.date}
        />
      ))}
    </Cards>
  );
};

export default Posts;
