export type Testimonial = {
  authorAvatar: string;
  authorName: string;
  url: string;
  quote: string;
};

/**
 * Wall-of-love entries shown on the landing page. Empty for now — the
 * Testimonials section hides itself until real snap-cn shoutouts land here.
 * Add entries as `{ authorAvatar, authorName, url, quote }` (avatars via
 * https://unavatar.io/x/<handle>, url pointing at the original post).
 */
export const testimonials: Testimonial[] = [];
