"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { limparDemonstracao } from "@/app/admin/acoes";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CheckIcon, TrashIcon } from "@/components/ui/icons";

interface LimparDemoProps {
  /** Quantas peças de exemplo ainda estão no site. */
  quantidade: number;
}

/**
 * Tira do ar o conteúdo de demonstração que veio na instalação (as lojas
 * inventadas, os slides e os vídeos de exemplo). O que o cliente cadastrou
 * não é tocado.
 */
export function LimparDemo({ quantidade }: LimparDemoProps) {
  const router = useRouter();
  const [perguntando, setPerguntando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [, iniciar] = useTransition();

  if (quantidade === 0 || pronto) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
        <CheckIcon className="size-5" />
        O site está só com o seu conteúdo.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPerguntando(true)}
        className="inline-flex items-center gap-2 rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3 text-base font-semibold text-danger transition-colors hover:bg-danger-soft"
      >
        <TrashIcon className="size-5" />
        Apagar as {quantidade} peças de exemplo
      </button>

      <ConfirmDialog
        open={perguntando}
        title="Apagar o conteúdo de exemplo?"
        message="Saem do site as lojas inventadas, os slides, destaques e vídeos que vieram na instalação. O que você cadastrou continua no lugar."
        confirmLabel="Sim, apagar o exemplo"
        onConfirm={() => {
          setPerguntando(false);
          iniciar(async () => {
            await limparDemonstracao();
            setPronto(true);
            router.refresh();
          });
        }}
        onCancel={() => setPerguntando(false)}
      />
    </>
  );
}
