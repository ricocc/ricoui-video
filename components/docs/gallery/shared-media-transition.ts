/**
 * The card and the overlay's preview are the same piece of video.
 *
 * Clicking a card used to mount a dialog that faded and zoomed in from nothing,
 * so the thing you clicked stayed where it was and a *second* copy of it
 * appeared somewhere else. This makes the browser treat them as one element: the
 * card you clicked travels and scales into the overlay's preview slot, and back
 * into the grid when you close it.
 *
 * How it works: exactly one element on the page may carry a given
 * `view-transition-name` at a time. We hand the name from the card to the
 * overlay inside the transition callback — the browser snapshots "before" with
 * the card holding it and "after" with the overlay holding it, then interpolates
 * between the two boxes. Two holders at once aborts the whole transition, which
 * is why the name is always cleared before it is granted elsewhere.
 *
 * Everything here is feature-detected and reduced-motion aware. Where a morph
 * cannot run, the state change still happens — you just get the plain open.
 */

/** The single shared name. Only ever on one element at a time. */
export const SHARED_MEDIA = "gallery-media";

/** Marks a card so the overlay can find it again on the way back. */
export const cardAttr = (slug: string) => ({ "data-gallery-slug": slug });

function findCard(slug: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-gallery-slug="${CSS.escape(slug)}"]`,
  );
}

function canMorph(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Give React a turn to commit, WITHOUT waiting for a frame.
 *
 * This must not use `requestAnimationFrame`. Rendering is suspended for the
 * whole of a view transition's update callback, so a frame callback never fires
 * — the callback hangs until Chrome's 4s DOM-update timeout, `ready` rejects
 * with "Transition was aborted because of timeout in DOM update", and you get
 * the jump cut the morph was supposed to replace. Measured, not guessed.
 *
 * Timers and microtasks are not render-gated, so a macrotask hop is enough: the
 * nuqs commit has already resolved by the time this is awaited, and React's
 * scheduler flushes on the same queue.
 */
function reactCommitted(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function run(update: () => Promise<void>, release: () => void): void {
  const transition = document.startViewTransition(update);
  // A skipped transition rejects `ready`, and `updateCallbackDone` rejects if
  // the callback threw. Unhandled, both surface in the console as a bare
  // "Uncaught (in promise)" with no stack — which is exactly how this module's
  // first version announced that it was silently skipping every morph.
  transition.ready.catch(() => {});
  transition.updateCallbackDone.catch(() => {});
  transition.finished.catch(() => {}).finally(release);
}

/** Grid → overlay. `card` is the element the user actually clicked. */
export function morphFromCard(
  card: HTMLElement | null,
  commit: () => unknown,
): void {
  if (!card || !canMorph()) {
    void commit();
    return;
  }
  // The "old" snapshot is taken when `startViewTransition` is called, so the
  // card must already hold the name here.
  card.style.viewTransitionName = SHARED_MEDIA;
  run(
    async () => {
      // Release FIRST, before the commit. The overlay claims the same name the
      // instant `commit` renders it, and a single painted frame with two
      // holders makes the browser skip the entire transition — which is the
      // jump-cut this exists to remove, not a cosmetic detail.
      card.style.viewTransitionName = "";
      await commit();
      await reactCommitted();
    },
    () => {
      card.style.viewTransitionName = "";
    },
  );
}

/** Overlay → grid. The card may be filtered out by now; then there is nothing
 *  to fly back to and the overlay simply fades. */
export function morphToCard(slug: string, commit: () => unknown): void {
  if (!canMorph()) {
    void commit();
    return;
  }
  let card: HTMLElement | null = null;
  run(
    async () => {
      // Base UI keeps the popup mounted through its close animation, so the
      // overlay only lets go of the name because it stops rendering it the
      // moment `item` goes null — see `holdsSharedName` in the overlay. The
      // paint wait is what guarantees that release lands before the card here
      // claims it; grabbing it any earlier is the two-holder skip again.
      await commit();
      await reactCommitted();
      card = findCard(slug);
      if (card) card.style.viewTransitionName = SHARED_MEDIA;
    },
    () => {
      if (card) card.style.viewTransitionName = "";
    },
  );
}
