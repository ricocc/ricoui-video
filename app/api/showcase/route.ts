import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDbConfigured } from "@/lib/server/db";
import { createSubmission } from "@/lib/server/showcase";
import { submissionInputSchema } from "@/lib/showcase/validation";

/** Create a showcase submission (auth required; lands as `pending`). */
export async function POST(req: Request) {
  if (!isDbConfigured) {
    return NextResponse.json(
      { error: "Showcase isn't configured yet." },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to submit your video." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = submissionInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 },
    );
  }

  try {
    const { id } = await createSubmission({
      userId: session.user.id,
      ...parsed.data,
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    console.error("[showcase] create failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
