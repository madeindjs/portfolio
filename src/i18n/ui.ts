export enum Langages {
  en = "en",
  fr = "fr",
}

export const defaultLang = Langages.en;

export type Dict = Record<string, string>;
export type Translations = Record<string, string | Dict | string[]>;

export const TRANSLATIONS_FR: Translations = {
  aboutMe: "A propos de moi",
  iLike: "J'aime",
  seeMore: "Voir plus",
  resume: "CV",
  resumeLite: "Curriculum vitæ",
  resumeFull: "Dossier de compétence complet",
  lastPost: "Derniers articles",
  seeAllPost: "Voir tous mes articles",
  tagResult: "Articles liés au tag",
  toc: "Sommaire",
  my_github_profile: "mon profil Github",
  my_educations: "Diplômes",
  lead: ["Bonjour, je m'appelle Alexandre.", "Je suis un développeur fullstack / DevOPS."],
  description: [
    'Je suis passionné par la programmation et le monde du logiciel libre. J\'essaie de contribuer au monde de l\'Open-source à mes projets personnels et différentes contributions sur <a href="https://github.com/madeindjs">Github</a> / <a href="https://gitlab.com/alexandre.rousseau">Gitlab</a>.',
    'J\'ai écris deux livres sous licence libre. <a href="https://github.com/madeindjs/api_on_rails">API on Rails</a> et <a href="https://github.com/madeindjs/rest-api.ts">REST-API.ts</a> qui enseignent les meilleurs pratiques pour construire une API avec Ruby on Rails ou Node.js (j\'en parle dans <a href="/story/2019/11/10/api-on-rails.html">cet article</a>).',
    'A côté de ça, j\'aime partager mes découvertes via <a href="/blog">des articles sur mon blog</a>.',
  ],
  footer: {
    poweredBy:
      'Ce site est propulsé par <a href="https://jekyllrb.com/">Jekyll</a>. Vous pouvez consulter le code source sur <a href="https://github.com/madeindjs/">Github</a>.',
    licence:
      'Tout le contenu est sous la license <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.',
    cookie: "Ce site ne vous piste pas, il n'y a pas de cookies ni de google analytics.",
  },

  post: {
    publishedAt: "Publié le",
    searchPlaceholder: "Tapez du texte pour trier les articles...",
    promoteApiOnRails:
      'Intéressé pour créer un API avec Ruby on Rails? Jette un coup d\'œil à mon livre: <strong>API on Rails 6</strong>. Tu peux <a href="https://github.com/madeindjs/api_on_rails" >télécharger une version gratuite au format PDF sur Github</a >. Si tu aimes mon travail <a href="https://leanpub.com/rest-api-ts-fr/" >tu peux acheter un version payante sur Leanpub</a >.',
    promoteRestApiTs:
      'Intéressé pour créer un API avec Typescript / Node.js? Jette un coup d\'œil à mon livre: <strong>REST-API.ts</strong>. Tu peux <a href="https://github.com/madeindjs/rest-api.ts" >télécharger une version gratuite au format PDF sur Github</a >. Si tu aimes mon travail <a href="https://leanpub.com/rest-api-ts/" >tu peux acheter un version payante sur Leanpub</a >.',
    relatedPosts: "Articles liés",
  },
  books: "Livres",
  blog: "Articles",
  read: "Voir",
  displayMore: "Afficher plus",
  "blog-description":
    "J'aime écrire à propos de mes découvertes sur divers sujets. J'écris aussi quelques articles en anglais",
  "blog-see-fr": "Voir mes articles en français",
  "blog-see-en": "Voir mes articles en anglais",
};

export const TRANSLATIONS_EN: Translations = {
  aboutMe: "About me",
  iLike: "I like",
  seeMore: "See more",
  resume: "Resume",
  resumeLite: "Resume",
  resumeFull: "Competency file",
  lastPost: "Last posts",
  seeAllPost: "See all posts",
  tagResult: "Post about tag",
  toc: "Table of content",
  lead: ["Hi, I'm Alexandre.", "I am a Fulstack developer / DevOPS."],
  description: [
    'I am passionate about programming and the world of open source software. I try to contribute to the open-source world at my personal projects and various contributions on <a href="https://github.com/madeindjs">Github</a> / <a href="https://gitlab.com/alexandre.rousseau">Gitlab</a>.',
    'I have written two books under a free license. <a href="https://github.com/madeindjs/api_on_rails">API on Rails</a> and <a href="https://github.com/madeindjs/rest-api.ts">REST-API.ts</a> that teach best practices for building an API with Ruby on Rails or Node.js  (I wrote about it <a href="/en/story/2019/11/10/api-on-rails.html">in this post</a>).',
    'Besides that, I like to share my findings via <a href="/en/blog">posts on my blog</a>.',
  ],
  footer: {
    poweredBy:
      'This website is powered by <a href="https://jekyllrb.com/">Jekyll</a>. You can find complete source code on <a href="https://github.com/madeindjs/">my github repository</a>.',
    licence:
      'All this content is under <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> licence.',
    cookie: "This site does not track you, there are no cookies or google analytics.",
  },
  books: "Books",
  blog: "Posts",
  read: "Read",
  displayMore: "Display more",
  "blog-description": "I love to write sometimes about my discoveries. I wrote also in french",
  "blog-see-fr": "See my posts in french",
  "blog-see-en": "See my posts in english",
  post: {
    publishedAt: "Published at",
    searchPlaceholder: "Type to filter posts...",
    promoteApiOnRails:
      'Interested about building and API using Ruby on Rails? Take a look on my brand new Book: <strong>API on Rails 6</strong>. You can <a href="https://github.com/madeindjs/api_on_rails" >grab a free PDF version on Github</a >. If you like my work, you can <a href="https://leanpub.com/apionrails6/">buy a paid version on Leanpub</a >.',
    promoteRestApiTs:
      'Interested about building and API using Node.js / Typescript ? Take a look on my brand new Book: <strong>REST-API.ts</strong>. You can <a href="https://github.com/madeindjs/rest-api.ts" >grab a free PDF version on Github</a >. If you like my work, you can <a href="https://leanpub.com/rest-api-ts/">buy a paid version on Leanpub</a>.',
    relatedPosts: "Related posts",
  },
};
