"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";

interface CopyFieldProps {
  label: string;
  value: string;
}

/** Caixa com o código do PIX e o botão de copiar. */
export function CopyField({ label, value }: CopyFieldProps) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Alguns navegadores bloqueiam a cópia automática: o texto continua
      // visível para o cliente selecionar à mão.
      setCopiado(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-strong">{label}</p>
      <div className="rounded-[var(--dm-radius-md)] border border-line bg-surface-sunken p-3">
        <p className="max-h-24 overflow-y-auto break-all font-mono text-xs leading-relaxed text-body">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copiar}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[var(--dm-radius-sm)] bg-ink-950 px-5 py-3.5 text-base font-semibold text-cream-50 transition-opacity hover:opacity-90 sm:w-auto"
      >
        {copiado ? (
          <>
            <CheckIcon className="size-5 text-gold-300" />
            Código copiado
          </>
        ) : (
          <>
            <CopyIcon className="size-5" />
            Copiar código do PIX
          </>
        )}
      </button>
      <p aria-live="polite" className="sr-only">
        {copiado ? "Código copiado para a área de transferência." : ""}
      </p>
    </div>
  );
}
