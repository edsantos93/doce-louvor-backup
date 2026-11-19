import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Largura mais estreita, usada em páginas de leitura como o contato. */
  narrow?: boolean;
}

export function Container({ children, className = "", narrow }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${
        narrow ? "max-w-3xl" : "max-w-[82rem]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
