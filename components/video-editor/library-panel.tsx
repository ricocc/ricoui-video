"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_ICONS,
  type CategoryId,
  GALLERY_CATEGORIES,
  GALLERY_ITEMS,
  slugFromHref,
} from "@/lib/gallery-data";
import { cn } from "@/lib/utils";
import registry from "@/registry/__index__";

type LibItem = { slug: string; name: string; category: CategoryId };

// Curated gallery items that actually have a renderable registry composition.
const ADDABLE: LibItem[] = GALLERY_ITEMS.map((it) => ({
  slug: slugFromHref(it.href),
  name: it.name,
  category: it.category,
})).filter((it) => Boolean(registry[it.slug]));

export function LibraryPanel({ onAdd }: { onAdd: (slug: string) => void }) {
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    const items = query
      ? ADDABLE.filter((it) => it.name.toLowerCase().includes(query))
      : ADDABLE;
    const byCat = new Map<CategoryId, LibItem[]>();
    for (const it of items) {
      const arr = byCat.get(it.category) ?? [];
      arr.push(it);
      byCat.set(it.category, arr);
    }
    return GALLERY_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      items: byCat.get(c.id) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [q]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Add components
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {groups.map((g) => {
          const Icon = CATEGORY_ICONS[g.id];
          return (
            <div key={g.id} className="mb-3">
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
                {Icon ? <Icon className="size-3.5" /> : null}
                {g.label}
              </div>
              <div className="flex flex-col">
                {g.items.map((it) => (
                  <button
                    key={it.slug}
                    type="button"
                    onClick={() => onAdd(it.slug)}
                    className={cn(
                      "group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted",
                    )}
                  >
                    <span className="truncate">{it.name}</span>
                    <Plus className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {groups.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">No matches.</p>
        ) : null}
      </div>
    </div>
  );
}
