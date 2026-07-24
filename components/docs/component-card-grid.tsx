import { ComponentCard } from "./component-card";

export interface CardItem {
  name: string;
  description: string;
  status: "stable" | "soon";
  href?: string;
}

export function ComponentCardGrid({ items }: { items: CardItem[] }) {
  return (
    <div className="not-prose my-8 columns-1 gap-5 sm:columns-2 xl:columns-3">
      {items.map((item) => (
        <ComponentCard key={item.name} item={item} />
      ))}
    </div>
  );
}
