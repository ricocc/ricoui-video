import { NAV_LINKS } from "@/config/site";
import { NavDesktop } from "./header-nav";
import { HeaderActions, HeaderLogo } from "./header-parts";
import { StickyHeaderShell } from "./sticky-header-shell";

export function SiteHeader() {
  return (
    <StickyHeaderShell>
      {/* Two groups, not three. Three children under `justify-between` push the
          nav into the middle of whatever space is left over, which strands it
          halfway across the bar with a hole beside the logo. The links belong
          to the logo. */}
      <div className="flex items-center gap-5">
        <HeaderLogo />
        <NavDesktop links={NAV_LINKS} />
      </div>
      <HeaderActions />
    </StickyHeaderShell>
  );
}
