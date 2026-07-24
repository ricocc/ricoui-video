import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/auth";
import { moderateSubmission } from "@/lib/server/showcase";

/** Approve or reject a submission (admin only). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;

  let action: unknown;
  try {
    action = (await req.json())?.action;
  } catch {
    action = undefined;
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'." },
      { status: 400 },
    );
  }

  try {
    await moderateSubmission(id, action);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[showcase] moderate failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
