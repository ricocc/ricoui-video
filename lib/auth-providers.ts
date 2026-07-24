/**
 * Client-safe provider identity + labels. Lives apart from `auth.ts` (which is
 * server-only) so client components — the sign-in buttons, the submit dialog —
 * can import these without pulling the server auth config into the client
 * bundle.
 */
export type AuthProviderId = "google" | "github" | "twitter" | "facebook";

export const PROVIDER_LABELS: Record<AuthProviderId, string> = {
  google: "Google",
  github: "GitHub",
  twitter: "X (Twitter)",
  facebook: "Facebook",
};
