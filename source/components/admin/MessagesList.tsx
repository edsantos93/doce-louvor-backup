"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { apagarRecado, marcarRecadoLido } from "@/app/admin/acoes";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CheckIcon, MailIcon, TrashIcon } from "@/components/ui/icons";
import { formatDate, formatTime } from "@/lib/format";
import type { Mensagem } from "@/lib/repositorio";

interface MessagesListProps {
  mensagens: Mensagem[];
}

export function MessagesList({ mensagens }: MessagesListProps) {
  const router = useRouter();
  const [, iniciar] = useTransition();
  const [apagadas, setApagadas] = useState<string[]>([]);
  const [paraApagar, setParaApagar] = useState<Mensagem | null>(null);

  const lista = mensagens.filter((item) => !apagadas.includes(item.id));

  if (lista.length === 0) {
    return (
      <p className="rounded-[var(--dm-radius-md)] border border-dashed border-line-strong bg-surface-sunken px-4 py-8 text-center text-base text-muted">
        Nenhuma mensagem ainda. Quando alguém escrever pelo formulário do
        site, aparece aqui.
      </p>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {lista.map((item) => (
          <li
            key={item.id}
            className={`rounded-[var(--dm-radius-lg)] border bg-surface-raised p-4 sm:p-5 ${
              item.lida ? "border-line" : "border-gold-400"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-strong">
                  {item.nome}
                  {!item.lida ? (
                    <span className="ml-2 rounded-full bg-gold-400 px-2 py-0.5 text-2xs font-bold uppercase tracking-wide text-on-brand">
                      Nova
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-muted">
                  {item.assunto} · {formatDate(item.criadoEm)} às{" "}
                  {formatTime(item.criadoEm)}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={`mailto:${item.email}?subject=${encodeURIComponent(
                    `Re: ${item.assunto}`,
                  )}`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--dm-radius-sm)] border border-line-strong px-3.5 py-2 text-sm font-semibold text-strong transition-colors hover:bg-surface-sunken"
                >
                  <MailIcon className="size-4" />
                  Responder
                </a>
                {!item.lida ? (
                  <button
                    type="button"
                    onClick={() =>
                      iniciar(async () => {
                        await marcarRecadoLido(item.id);
                        router.refresh();
                      })
                    }
                    aria-label={`Marcar a mensagem de ${item.nome} como lida`}
                    className="grid size-9 place-items-center rounded-[var(--dm-radius-sm)] border border-line-strong text-success transition-colors hover:bg-success-soft"
                  >
                    <CheckIcon className="size-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setParaApagar(item)}
                  aria-label={`Apagar a mensagem de ${item.nome}`}
                  className="grid size-9 place-items-center rounded-[var(--dm-radius-sm)] border border-line-strong text-danger transition-colors hover:bg-danger-soft"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>

            <p className="mt-3 whitespace-pre-line border-t border-line-soft pt-3 text-base text-body">
              {item.mensagem}
            </p>

            <p className="mt-3 text-xs text-muted">
              Responder para: {item.email}
              {item.enviada ? " · também foi para o seu e-mail" : ""}
            </p>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(paraApagar)}
        title="Apagar esta mensagem?"
        message={
          paraApagar
            ? `A mensagem de ${paraApagar.nome} some do painel e não dá para desfazer.`
            : ""
        }
        onConfirm={() => {
          if (paraApagar) {
            const id = paraApagar.id;
            setApagadas((atual) => [...atual, id]);
            iniciar(async () => {
              await apagarRecado(id);
              router.refresh();
            });
          }
          setParaApagar(null);
        }}
        onCancel={() => setParaApagar(null)}
      />
    </div>
  );
}
