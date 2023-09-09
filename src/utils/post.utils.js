/**
 * @param {string} completeSlug
 * @returns {'en' | 'fr'}
 */
export function getPostLanguage(completeSlug) {
  const [lang] = completeSlug.split("/");

  return lang;
}

/**
 * @param {string} completeSlug
 */
export function getPostUrl(completeSlug) {
  const slug = getPostSlug(completeSlug);
  const lang = getPostLanguage(completeSlug);

  return `/${lang}/blog/${slug}`;
}

/**
 * @param {string} completeSlug
 */
export function getJekyllPostUrl(completeSlug) {
  const slug = getPostSlug(completeSlug);

  return `/blog/${slug}`;
}

/**
 * @param {string} completeSlug
 */
export function getPostSlug(completeSlug) {
  const [, slugWithoutLang] = completeSlug.split("/");

  return slugWithoutLang.replace(/[0-9]{4}-[0-9]{2}-[0-9]{2}-/, "");
}

/**
 * @param {import("@/model").Post} post
 * @param {import("@/model").Post[]} allPosts
 * @returns {import("@/model").Post[]}
 */
export function getSimilarPosts(post, allPosts) {
  /**
   * @param {import("@/model").Post} a
   * @param {import("@/model").Post} b
   */
  function getCommonTags(a, b) {
    return a.data.tags.filter((tag) => b.data.tags.includes(tag));
  }

  return allPosts
    .filter((p) => p.slug !== post.slug && getCommonTags(post, p).length)
    .sort((p) => getCommonTags(post, p).length);
}
