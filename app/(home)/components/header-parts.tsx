import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  return (
    <Link
      href="/"
      aria-label="snap-cn home"
      className="flex items-center focus-visible:outline-none"
    >
      <Image
        src="/logo/snapcn.png"
        alt="snap-cn"
        width={464}
        height={409}
        priority
        className="h-7 w-auto rounded-md"
      />
    </Link>
  );
}

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <SearchButton className="lg:w-56" />
      <div className="hidden sm:block">
        <GithubButton />
      </div>
      <ThemeToggle />

      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="rounded-md sm:hidden"
              aria-label="Open menu"
            />
          }
        >
          <Menu className="size-4" aria-hidden="true" />
        </SheetTrigger>
        <SheetContent side="right" className="bg-background">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <NavMobile links={NAV_LINKS} />
          <div className="mt-4 flex flex-col gap-4 px-6 pb-6">
            <GithubButton />
            <SheetClose
              render={
                <Link
                  href="/docs/getting-started/introduction"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 w-full rounded-lg",
                  )}
                />
              }
            >
              Get started
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
