export interface Post {
  frontmatter: {
    title: string;
    tags: string[];
    date: string;
    image?: any;
    lang: string;
  };
  fields: {
    slug: string;
  };
  html: string;
  experp: string;
  category: string;
  lang: string;
}
