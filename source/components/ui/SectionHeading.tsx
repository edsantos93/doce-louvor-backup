import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  /** Linha de apoio em texto corrido, opcional. */
  hint?: string;
  /** Ação à direita: link "ver todas", contador etc. */
  action?: ReactNode;
  id?: string;
  size?: "sm" | "md";
}

/** Título de seção com o filete dourado da marca. */
export function SectionHeading({
  title,
  hint,
  action,
  id,
  size = "md",
}: SectionHeadingProps) {
  return (
    <div className="mb-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id={id}
            className={
              size === "sm"
                ? "font-display text-xl text-strong"
                : "font-display text-2xl text-strong"
            }
          >
            {title}
          </h2>
          {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-0.5 w-10 rounded-full bg-brand" />
        <span className="h-px flex-1 bg-line-soft" />
      </div>
    </div>
  );
}
