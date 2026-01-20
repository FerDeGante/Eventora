import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="bloom-section-heading">
      {eyebrow && <p className="bloom-section-heading__eyebrow">{eyebrow}</p>}
      <h2 className="bloom-section-heading__title">{title}</h2>
      {children && <p className="bloom-section-heading__copy">{children}</p>}
    </header>
  );
}
