/**
 * The handwritten "new" annotation next to the sidebar's "UI" link — a rotated
 * Caveat-script label with a hand-drawn underline squiggle, colored by the
 * `--annotation-new` token (see DESIGN.md "Gallery pattern"). `aria-hidden`
 * keeps the link's accessible name clean ("UI", not "UI new").
 */
export function NewScribble() {
  return (
    <span
      aria-hidden="true"
      className="relative ml-1.5 inline-block -rotate-6 select-none text-[13px] font-semibold leading-none text-annotation-new"
      style={{ fontFamily: "var(--font-scribble)" }}
    >
      new
      <svg
        viewBox="0 0 40 8"
        className="absolute -bottom-1.5 left-0 w-full"
        fill="none"
      >
        <path
          d="M1 5 C 8 2, 14 7, 20 4 S 33 2, 39 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
