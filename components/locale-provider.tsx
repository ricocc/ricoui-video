"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localizeHref } from "@/lib/i18n/config";
import type { MessageKey } from "@/lib/i18n/messages";

type Dictionary = Record<MessageKey, string>;

const LocaleContext = createContext<{
  locale: Locale;
  messages: Dictionary;
} | null>(null);

export function LocaleProvider({
  children,
  locale,
  messages,
}: {
  children: ReactNode;
  locale: Locale;
  messages: Dictionary;
}) {
  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useI18n must be used inside LocaleProvider");

  return {
    locale: context.locale,
    t: (key: MessageKey) => context.messages[key],
    href: (path: string) => localizeHref(path, context.locale),
  };
}
