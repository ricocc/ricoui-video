export const locales = ["en", "zh-CN"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh-CN";
export const englishPrefix = "/en";

function stripLocalePrefix(href: string): string {
  return href.replace(/^\/(?:en|zh)(?=\/|$)/, "") || "/";
}

export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const unprefixed = stripLocalePrefix(href);
  if (locale === "zh-CN") return unprefixed;
  return unprefixed === "/" ? englishPrefix : `${englishPrefix}${unprefixed}`;
}
