"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { type AuthProviderId, PROVIDER_LABELS } from "@/lib/auth-providers";

/**
 * One button per configured OAuth provider. `providers` is computed server-side
 * from which credentials are set, so this only ever renders working options.
 */
export function SignInButtons({
  providers,
  callbackUrl = "/docs/showcase",
}: {
  providers: AuthProviderId[];
  callbackUrl?: string;
}) {
  if (providers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign-in isn't configured yet — check back soon.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {providers.map((id) => (
        <Button
          key={id}
          variant="outline"
          className="w-full justify-center"
          onClick={() => signIn(id, { callbackUrl })}
        >
          Continue with {PROVIDER_LABELS[id]}
        </Button>
      ))}
    </div>
  );
}
