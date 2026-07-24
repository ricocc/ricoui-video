import "server-only";
import { desc, eq } from "drizzle-orm";
import { showcaseSubmissions, users } from "@/lib/db/schema";
import { getDb, isDbConfigured } from "@/lib/server/db";
import { detectPlatform, type Platform } from "@/lib/showcase/platform";

export type ShowcaseItem = {
  id: string;
  title: string;
  postUrl: string;
  platform: Platform;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
  authorName: string | null;
  authorImage: string | null;
};

const selectFields = {
  id: showcaseSubmissions.id,
  title: showcaseSubmissions.title,
  postUrl: showcaseSubmissions.postUrl,
  platform: showcaseSubmissions.platform,
  description: showcaseSubmissions.description,
  thumbnailUrl: showcaseSubmissions.thumbnailUrl,
  createdAt: showcaseSubmissions.createdAt,
  authorName: users.name,
  authorImage: users.image,
};

export async function getApprovedSubmissions(): Promise<ShowcaseItem[]> {
  if (!isDbConfigured) return [];
  try {
    return await getDb()
      .select(selectFields)
      .from(showcaseSubmissions)
      .leftJoin(users, eq(showcaseSubmissions.userId, users.id))
      .where(eq(showcaseSubmissions.status, "approved"))
      .orderBy(
        desc(showcaseSubmissions.featured),
        desc(showcaseSubmissions.createdAt),
      );
  } catch (err) {
    console.error("[showcase] getApprovedSubmissions failed:", err);
    return [];
  }
}

export async function getPendingSubmissions(): Promise<ShowcaseItem[]> {
  if (!isDbConfigured) return [];
  try {
    return await getDb()
      .select(selectFields)
      .from(showcaseSubmissions)
      .leftJoin(users, eq(showcaseSubmissions.userId, users.id))
      .where(eq(showcaseSubmissions.status, "pending"))
      .orderBy(desc(showcaseSubmissions.createdAt));
  } catch (err) {
    console.error("[showcase] getPendingSubmissions failed:", err);
    return [];
  }
}

export async function createSubmission(input: {
  userId: string;
  title: string;
  postUrl: string;
  description?: string;
}): Promise<{ id: string }> {
  const platform = detectPlatform(input.postUrl);
  const thumbnailUrl = await fetchOgImage(input.postUrl);
  const [row] = await getDb()
    .insert(showcaseSubmissions)
    .values({
      userId: input.userId,
      title: input.title,
      postUrl: input.postUrl,
      platform,
      description: input.description ?? null,
      thumbnailUrl,
    })
    .returning({ id: showcaseSubmissions.id });
  return row;
}

export async function moderateSubmission(
  id: string,
  action: "approve" | "reject",
): Promise<void> {
  await getDb()
    .update(showcaseSubmissions)
    .set({
      status: action === "approve" ? "approved" : "rejected",
      updatedAt: new Date(),
    })
    .where(eq(showcaseSubmissions.id, id));
}

/**
 * Best-effort scrape of the post's og:image for a card thumbnail. Many social
 * sites block this (return a login wall / non-200) — in which case we return
 * null and the card falls back to a platform-branded tile. Failure-tolerant by
 * design, mirroring `lib/github.ts`.
 */
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; snap-cn/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match =
      html.match(
        /<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i,
      ) ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i,
      );
    const src = match?.[1];
    if (!src) return null;
    return /^https?:\/\//i.test(src) ? src : null;
  } catch {
    return null;
  }
}
