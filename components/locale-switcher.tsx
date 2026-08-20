"use client";

import { Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/locale-provider";
import { localizeHref } from "@/lib/i18n/config";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const nextLocale = locale === "en" ? "zh-CN" : "en";
  const target = localizeHref(pathname, nextLocale);

  return (
    <Link
      href={target}
      lang={nextLocale === "zh-CN" ? "zh-CN" : "en"}
      hrefLang={nextLocale === "zh-CN" ? "zh-CN" : "en"}
      aria-label={`Switch to ${t("nav.language")}`}
      className="inline-flex h-9 items-center gap-1.5 rounded-4xl border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
    >
      <Languages aria-hidden />
      <span className="hidden md:inline">{t("nav.language")}</span>
    </Link>
  );
}
