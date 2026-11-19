"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { removerPeca, salvarOrdem, salvarPeriodo } from "@/app/admin/acoes";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ScheduleFields } from "@/components/admin/ScheduleFields";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  GripIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import type { AdStatus } from "@/lib/types";

export interface ReorderableItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  alt: string;
  startDate: string;
  endDate: string;
  status: AdStatus;
}

interface ReorderableListProps {
  items: ReorderableItem[];
  /** Nome do item no singular: "slide", "destaque". */
  noun: string;
  /** Tabela do banco que guarda esses itens. */
  tabela: "slides" | "destaques" | "videos";
}

/**
 * Lista com alça de arrastar para mudar a ordem, e as mesmas datas de início
 * e fim dos banners. Quem não quiser arrastar usa os botões de subir e descer.
 */
export function ReorderableList({
  items,
  noun,
  tabela,
}: ReorderableListProps) {
  const router = useRouter();
  const [, iniciar] = useTransition();
  const [lista, setLista] = useState(items);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [aberto, setAberto] = useState<string | null>(null);
  const [paraApagar, setParaApagar] = useState<ReorderableItem | null>(null);
  const [aviso, setAviso] = useState("");
  const rascunho = useRef<Record<string, { start: string; end: string }>>({});

  function mover(de: number, para: number) {
    if (para < 0 || para >= lista.length) return;

    setLista((atual) => {
      const copia = [...atual];
      const [item] = copia.splice(de, 1);
      copia.splice(para, 0, item);
      setAviso(`${item.title} foi para a posição ${para + 1} de ${copia.length}.`);

      iniciar(async () => {
        await salvarOrdem(
          tabela,
          copia.map((linha) => linha.id),
        );
        router.refresh();
      });

      return copia;
    });
  }

  function datasDoItem(item: ReorderableItem) {
    return (
      rascunho.current[item.id] ?? { start: item.startDate, end: item.endDate }
    );
  }

  function salvarDatas(item: ReorderableItem) {
    const datas = datasDoItem(item);

    if (tabela !== "videos") {
      iniciar(async () => {
        await salvarPeriodo(tabela, item.id, datas.start, datas.end);
        router.refresh();
      });
    }

    setLista((atual) =>
      atual.map((linha) =>
        linha.id === item.id
          ? { ...linha, startDate: datas.start, endDate: datas.end }
          : linha,
      ),
    );
    setAberto(null);
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Arraste pela alça{" "}
        <GripIcon className="inline-block size-4 align-text-bottom" /> para mudar
        a ordem em que aparecem no site. A primeira da lista é a primeira a
        aparecer.
      </p>

      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>

      <ul className="space-y-3">
        {lista.map((item, indice) => {
          const datas = datasDoItem(item);
          const expandido = aberto === item.id;

          return (
            <li
              key={item.id}
              draggable
              onDragStart={() => setArrastando(indice)}
              onDragOver={(evento) => evento.preventDefault()}
              onDrop={() => {
                if (arrastando !== null) mover(arrastando, indice);
                setArrastando(null);
              }}
              onDragEnd={() => setArrastando(null)}
              className={`rounded-[var(--dm-radius-lg)] border bg-surface-raised transition-colors ${
                arrastando === indice
                  ? "border-gold-500 opacity-60"
                  : "border-line"
              }`}
            >
              <div className="flex items-start gap-3 p-3 sm:items-center sm:gap-4 sm:p-4">
                <span
                  aria-hidden
                  className="hidden cursor-grab select-none rounded-[var(--dm-radius-sm)] p-2 text-ink-400 hover:bg-surface-sunken sm:block"
                >
                  <GripIcon className="size-5" />
                </span>

                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-950 text-sm font-semibold text-gold-300">
                  {indice + 1}
                </span>

                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[var(--dm-radius-sm)] bg-surface-sunken sm:h-16 sm:w-28">
                  <Image
                    src={item.imageUrl}
                    alt={item.alt}
                    fill
                    quality={90}
                    sizes="(min-width: 640px) 112px, 80px"
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-strong">{item.title}</p>
                  <p className="clamp-2 text-sm text-muted">{item.subtitle}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-muted">
                      {formatDate(item.startDate)} a {formatDate(item.endDate)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => mover(indice, indice - 1)}
                      disabled={indice === 0}
                      aria-label={`Mover ${item.title} para cima`}
                      className="grid size-10 place-items-center rounded-[var(--dm-radius-sm)] border border-line-strong text-strong transition-colors hover:bg-surface-sunken disabled:opacity-35"
                    >
                      <ArrowUpIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(indice, indice + 1)}
                      disabled={indice === lista.length - 1}
                      aria-label={`Mover ${item.title} para baixo`}
                      className="grid size-10 place-items-center rounded-[var(--dm-radius-sm)] border border-line-strong text-strong transition-colors hover:bg-surface-sunken disabled:opacity-35"
                    >
                      <ArrowDownIcon className="size-4" />
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setAberto(expandido ? null : item.id)}
                      aria-expanded={expandido}
                      className="inline-flex h-10 items-center gap-1.5 rounded-[var(--dm-radius-sm)] border border-line-strong px-3 text-sm font-semibold text-strong transition-colors hover:bg-surface-sunken"
                    >
                      <CalendarIcon className="size-4" />
                      Datas
                    </button>
                    <button
                      type="button"
                      onClick={() => setParaApagar(item)}
                      aria-label={`Apagar ${item.title}`}
                      className="grid size-10 place-items-center rounded-[var(--dm-radius-sm)] border border-line-strong text-danger transition-colors hover:bg-danger-soft"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {expandido ? (
                <div className="border-t border-line-soft p-3 sm:p-4">
                  <ScheduleFields
                    start={datas.start}
                    end={datas.end}
                    onChange={(campo, valor) => {
                      rascunho.current[item.id] = {
                        ...datas,
                        [campo]: valor,
                      };
                      setAberto(item.id);
                    }}
                  />
                  <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setAberto(null)}
                      className="rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => salvarDatas(item)}
                      className="rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300"
                    >
                      Salvar datas
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={Boolean(paraApagar)}
        title={`Apagar este ${noun}?`}
        message={
          paraApagar
            ? `"${paraApagar.title}" sai do site na hora e não dá para desfazer.`
            : ""
        }
        onConfirm={() => {
          if (paraApagar) {
            const id = paraApagar.id;
            setLista((atual) => atual.filter((linha) => linha.id !== id));
            iniciar(async () => {
              await removerPeca(tabela, id);
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
