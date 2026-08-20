import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";
import { fumadocsI18n } from "@/lib/i18n/fumadocs";

export const source = loader({
  baseUrl: "/docs",
  i18n: fumadocsI18n,
  source: docs.toFumadocsSource(),
});
