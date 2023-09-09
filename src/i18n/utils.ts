import { Langages, TRANSLATIONS_EN, TRANSLATIONS_FR, defaultLang, type Translations } from "./ui";

export function getLangFromUrl(url: URL): Langages {
  const [, lang] = url.pathname.split("/");
  if (Object.values(Langages).includes(lang as Langages)) return lang as Langages;
  return defaultLang;
}

export function useTranslationsObject<T extends Translations>(
  lang: Langages,
  trans: { en: T; fr: T } = { en: {}, fr: {} }
): (typeof TRANSLATIONS_FR | typeof TRANSLATIONS_EN) & T {
  if (lang === Langages.en) return { ...TRANSLATIONS_EN, ...trans.en };
  return { ...TRANSLATIONS_FR, ...trans.fr };
}
