"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removerBanner } from "@/app/admin/acoes";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TrashIcon } from "@/components/ui/icons";
import { AD_SPECS } from "@/lib/ads";
import { daysUntil, formatBRL, formatDate } from "@/lib/format";
import type { AdCreative, AdStatus } from "@/lib/types";

interface BannersTableProps {
  banners: AdCreative[];
}

const FILTROS: { id: AdStatus | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "no-ar", label: "No ar" },
  { id: "agendado", label: "Agendados" },
  { id: "aguardando-pagamento", label: "Aguardando pagamento" },
  { id: "expirado", label: "Expirados" },
];

/** "sai em 12 dias" — só para o que está no ar. */
function avisoDeSaida(banner: AdCreative): string | null {
  if (banner.status !== "no-ar") return null;
  const dias = daysUntil(banner.endDate);
  if (dias < 0) return null;
  if (dias === 0) return "sai hoje";
  return dias === 1 ? "sai amanhã" : `sai em ${dias} dias`;
}

export function BannersTable({ banners }: BannersTableProps) {
  const router = useRouter();
  const [apagados, setApagados] = useState<string[]>([]);
  const [, iniciar] = useTransition();
  const lista = banners.filter((banner) => !apagados.includes(banner.id));
  const [filtro, setFiltro] = useState<AdStatus | "todos">("todos");
  const [paraApagar, setParaApagar] = useState<AdCreative | null>(null);

  const visiveis =
    filtro === "todos"
      ? lista
      : lista.filter((banner) => banner.status === filtro);

  function apagar() {
    if (!paraApagar) return;
    const id = paraApagar.id;
    setApagados((atual) => [...atual, id]);
    setParaApagar(null);
    iniciar(async () => {
      await removerBanner(id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS.map((item) => {
          const ativo = filtro === item.id;
          const total =
            item.id === "todos"
              ? lista.length
              : lista.filter((banner) => banner.status === item.id).length;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFiltro(item.id)}
              aria-pressed={ativo}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                ativo
                  ? "bg-ink-950 text-cream-50"
                  : "border border-line-strong text-strong hover:bg-surface-sunken"
              }`}
            >
              {item.label} ({total})
            </button>
          );
        })}
      </div>

      {/* celular: um cartão por banner */}
      <ul className="space-y-3 md:hidden">
        {visiveis.map((banner) => (
          <li
            key={banner.id}
            className="rounded-[var(--dm-radius-md)] border border-line bg-surface-raised p-3"
          >
            <div className="flex gap-3">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-[var(--dm-radius-sm)] border border-line-soft bg-surface-sunken">
                <Image
                  src={banner.imageUrl}
                  alt={banner.alt}
                  fill
                  quality={90}
                  sizes="112px"
                  className="object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-strong">
                  {banner.advertiserName}
                </p>
                <p className="truncate text-sm text-muted">
                  {AD_SPECS[banner.slot].short}
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={banner.status} />
                </div>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-line-soft pt-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Período</dt>
                <dd className="text-strong">
                  {formatDate(banner.startDate)} a {formatDate(banner.endDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Valor</dt>
                <dd className="text-strong">{formatBRL(banner.priceCents)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex gap-2">
              <Link
                href="/admin/banners/novo"
                className="flex-1 rounded-[var(--dm-radius-sm)] border border-line-strong px-4 py-2.5 text-center text-sm font-semibold text-strong"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => setParaApagar(banner)}
                className="inline-flex items-center gap-1.5 rounded-[var(--dm-radius-sm)] border border-line-strong px-4 py-2.5 text-sm font-semibold text-danger"
              >
                <TrashIcon className="size-4" />
                Apagar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* computador: tabela */}
      <div className="hidden overflow-x-auto rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised md:block">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <caption className="sr-only">
            Banners cadastrados, com anunciante, posição, período, valor e
            situação.
          </caption>
          <thead>
            <tr className="border-b border-line-soft bg-surface-sunken text-xs uppercase tracking-[0.1em] text-muted">
              <th scope="col" className="px-3 py-3 font-semibold">
                Imagem
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Anunciante
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Posição
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Início
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Fim
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Valor
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Situação
              </th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((banner) => {
              const aviso = avisoDeSaida(banner);

              return (
                <tr
                  key={banner.id}
                  className="border-b border-line-soft last:border-b-0 hover:bg-surface-sunken"
                >
                  <td className="px-3 py-3">
                    <div className="relative h-14 w-28 overflow-hidden rounded-[var(--dm-radius-sm)] border border-line-soft bg-surface-sunken">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.alt}
                        fill
                        quality={90}
                        sizes="112px"
                        className="object-contain"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-strong">
                    {banner.advertiserName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-body">
                    {AD_SPECS[banner.slot].short}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-body">
                    {formatDate(banner.startDate)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-body">
                    {formatDate(banner.endDate)}
                    {aviso ? (
                      <span className="block text-xs text-gold-700">
                        {aviso}
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold text-strong">
                    {formatBRL(banner.priceCents)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={banner.status} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href="/admin/banners/novo"
                        className="rounded-[var(--dm-radius-sm)] border border-line-strong px-3 py-2 text-sm font-semibold text-strong transition-colors hover:bg-surface-raised"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => setParaApagar(banner)}
                        aria-label={`Apagar o banner de ${banner.advertiserName}`}
                        className="grid size-9 place-items-center rounded-[var(--dm-radius-sm)] border border-line-strong text-danger transition-colors hover:bg-danger-soft"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visiveis.length === 0 ? (
        <p className="rounded-[var(--dm-radius-md)] border border-dashed border-line-strong bg-surface-sunken px-4 py-8 text-center text-base text-muted">
          Nenhum banner nesta situação.
        </p>
      ) : null}

      <ConfirmDialog
        open={Boolean(paraApagar)}
        title="Apagar este banner?"
        message={
          paraApagar
            ? `A propaganda de ${paraApagar.advertiserName} sai do site na hora e não dá para desfazer.`
            : ""
        }
        onConfirm={apagar}
        onCancel={() => setParaApagar(null)}
      />
    </div>
  );
}
