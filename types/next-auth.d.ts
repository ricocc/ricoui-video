import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /** Expose the database user id on the session (set in `auth.ts` callbacks). */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
