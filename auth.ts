import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Facebook from "next-auth/providers/facebook";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import type { AuthProviderId } from "@/lib/auth-providers";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { getDb, isDbConfigured } from "@/lib/server/db";

const PROVIDER_ENV: Record<AuthProviderId, [idKey: string, secretKey: string]> =
  {
    google: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
    github: ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"],
    twitter: ["AUTH_TWITTER_ID", "AUTH_TWITTER_SECRET"],
    facebook: ["AUTH_FACEBOOK_ID", "AUTH_FACEBOOK_SECRET"],
  };

/**
 * Which OAuth providers actually have credentials set. Drives both the
 * registered providers below and the sign-in UI, so the app builds and boots
 * with zero OAuth setup (the sign-in menu simply shows nothing).
 */
export function getConfiguredProviders(): AuthProviderId[] {
  return (Object.keys(PROVIDER_ENV) as AuthProviderId[]).filter((id) => {
    const [idKey, secretKey] = PROVIDER_ENV[id];
    return Boolean(process.env[idKey] && process.env[secretKey]);
  });
}

/** Comma-separated allow-list of admin emails (`ADMIN_EMAILS`). */
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

function providers() {
  const factories = {
    google: Google,
    github: GitHub,
    twitter: Twitter,
    facebook: Facebook,
  } as const;
  // Each provider auto-reads its `AUTH_<NAME>_ID/_SECRET` env pair.
  return getConfiguredProviders().map((id) => factories[id]);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Without a DB the adapter is omitted so construction can't throw pre-setup;
  // sign-in is also unavailable then (no providers), which is the intended
  // "not configured yet" state.
  adapter: isDbConfigured
    ? DrizzleAdapter(getDb(), {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
  providers: providers(),
  callbacks: {
    session({ session, user }) {
      // Database-session strategy: expose the user id to server code.
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
