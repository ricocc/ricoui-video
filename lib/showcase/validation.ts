import { z } from "zod";

/**
 * Server-side validation for the public submit endpoint (untrusted input). The
 * URL check is done manually (rather than via a zod format helper) so it stays
 * stable across zod versions and also pins the protocol to http(s).
 */
export const submissionInputSchema = z.object({
  title: z.string().trim().min(2, "Give it a short title.").max(120),
  postUrl: z
    .string()
    .trim()
    .min(1, "Paste the link to your post.")
    .max(2048)
    .refine((v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid http(s) URL."),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type SubmissionInput = z.infer<typeof submissionInputSchema>;
