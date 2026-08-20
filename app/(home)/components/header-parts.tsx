"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { BrandWordmark } from "@/components/brand-wordmark";
import { useI18n } from "@/components/locale-provider";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SearchButton } from "@/components/search-button";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/config/site";
import { cn } from "@/lib/utils";
import { GithubButton } from "./github-button";
import { NavMobile } from "./header-nav";
import { ThemeToggle } from "./theme-toggle";

export function HeaderLogo() {
  const { href } = useI18n();
  return (
    <Link
      href={href("/")}
      aria-label="RICOUI Video home"
      className="flex items-center focus-visible:outline-none"
    >
      <BrandWordmark />
    </Link>
  );
}

export function HeaderActions({ stars }: { stars: number | null }) {
  const { href, t } = useI18n();
  return (
    <div className="flex items-center gap-1.5">
      <SearchButton className="lg:w-52" />
      <div className="hidden sm:block">
        <GithubButton stars={stars} />
      </div>
      <ThemeToggle />
      <LocaleSwitcher />

      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden"
              aria-label={t("nav.menu")}
            />
          }
        >
          <Menu className="size-4" aria-hidden="true" />
        </SheetTrigger>
        <SheetContent side="right" className="bg-background">
          <SheetHeader>
            <SheetTitle>{t("nav.menu")}</SheetTitle>
          </SheetHeader>
          <NavMobile links={NAV_LINKS} />
          <div className="mt-4 flex flex-col gap-4 px-6 pb-6">
            <GithubButton stars={stars} />
            <SheetClose
              render={
                <Link
                  href={href("/docs/getting-started/introduction")}
                  className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
                />
              }
            >
              {t("nav.getStarted")}
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
