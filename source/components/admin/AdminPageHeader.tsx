import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  /** Uma frase explicando para que serve a tela, sem termo técnico. */
  description: string;
  /** A única ação principal da tela. */
  action?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <header className="border-b border-line-soft bg-surface-raised">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-end md:justify-between md:py-8 lg:px-10">
        <div>
          <h1 className="font-display text-3xl text-strong">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-base text-muted">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

/** Corpo padrão das telas do painel. */
export function AdminPageBody({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-10">
      {children}
    </div>
  );
}
