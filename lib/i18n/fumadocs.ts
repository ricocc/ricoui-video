import { defineI18n } from "fumadocs-core/i18n";

export const fumadocsI18n = defineI18n({
  languages: ["en", "zh-CN"],
  defaultLanguage: "en",
  hideLocale: "default-locale",
  parser: "dot",
  fallbackLanguage: "en",
});
