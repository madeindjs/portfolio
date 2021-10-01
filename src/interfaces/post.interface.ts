export interface Post {
  frontmatter: {
    title: string;
    tags: string[];
    date?: string;
    image?: any;
  };
  fields: {
    slug: string;
    type: "note" | "post";
  };
  html: string;
  experp: string;
  category: string;
  lang: string;
}
