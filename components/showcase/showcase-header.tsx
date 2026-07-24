"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import type { AuthProviderId } from "@/lib/auth-providers";
import { SignInButtons } from "./sign-in-buttons";
import { SubmitForm } from "./submit-form";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | null;

/**
 * The page title row + the submit entry point. The same "Submit your video"
 * button opens a dialog that shows either the submit form (signed in) or the
 * sign-in options (signed out). The `<Toaster/>` is mounted here (always
 * rendered) so a "Submitted!" toast survives closing the dialog — mirroring the
 * scoped-Toaster precedent in `app/(home)/stars`.
 */
export function ShowcaseHeader({
  user,
  providers,
}: {
  user: SessionUser;
  providers: AuthProviderId[];
}) {
  const [open, setOpen] = useState(false);
  const signedIn = Boolean(user?.id);

  return (
    <div className="pt-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl font-semibold tracking-tight text-foreground"
          >
            Showcase
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Videos built with snap-cn, shared by the people who made them.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <div className="flex items-center gap-2">
              {user?.image ? (
                // biome-ignore lint/performance/noImgElement: OAuth-provider avatar from an arbitrary host
                <img
                  src={user.image}
                  alt=""
                  className="size-7 rounded-full object-cover"
                />
              ) : null}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Sign out"
                onClick={() => signOut()}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : null}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button>Submit your video</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {signedIn ? "Share your video" : "Sign in to share"}
                </DialogTitle>
                <DialogDescription>
                  {signedIn
                    ? "Paste the link to your post — we'll review it before it appears."
                    : "You need an account so we can credit your work."}
                </DialogDescription>
              </DialogHeader>
              {signedIn ? (
                <SubmitForm onDone={() => setOpen(false)} />
              ) : (
                <SignInButtons providers={providers} />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
