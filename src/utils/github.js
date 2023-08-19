import { Langages } from "../i18n/ui";

/**
 * @returns {Promise<import("../model").Repository[]>}
 */
export async function fetchMyRepositories() {
  const res = await fetch(`https://api.github.com/users/madeindjs/repos?sort=pushed&per_page=100`);

  const data = await res.json();

  if (!res.ok) {
    console.error(data);
    return [];
  }
  return data;
}

/**
 * @param {string} repo
 * @returns {Promise<import("../model").Repository>}
 */
export function fetchGithubRepositoryInfo(repo) {
  return fetch(`https://api.github.com/repos/${repo}`).then((res) => res.json());
}

/**
 *
 * @param {import("../model").Repository} repo
 * @returns {import("../model").Project}
 */
export function convertGithubRepoToProject(repo) {
  return {
    title: repo.name,
    description: {
      [Langages.fr]: repo.description,
      [Langages.en]: repo.description,
    },
    github: repo.html_url,
    githubStars: Number(repo.stargazers_count),
    url: repo.homepage,
    topics: repo.topics,
  };
}
