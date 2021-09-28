import * as React from "react";
import FlipCard from "./FlipCard";

interface Props {
  name: string;
  description: string | React.ReactElement;
  cover: string;
}

const BookCard: React.FC<Props> = (props) => {
  return (
    <FlipCard front={<p>{props.name}</p>} back={<p>{props.description}</p>} />
  );
};

export default BookCard;
