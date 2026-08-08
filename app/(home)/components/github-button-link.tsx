"use client";

import Link from "next/link";
import { GITHUB_URL } from "@/config/site";
import { useTrackEvent } from "@/lib/analytics";

/**
 * The clickable half of `GithubButton`.
 *
 * Split off only because the star count is fetched on the server and an
 * `onClick` cannot cross that boundary. Everything visual stays in the parent;
 * this file exists so the header CTA reports `cta_clicked` like every other CTA
 * on the site, instead of relying on autocapture to notice a `data-` attribute.
 */
export function GithubButtonLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const trackEvent = useTrackEvent();

  return (
    <Link
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() =>
        trackEvent("cta_clicked", {
          cta: "github_header",
          destination: GITHUB_URL,
        })
      }
    >
      {children}
    </Link>
  );
}
