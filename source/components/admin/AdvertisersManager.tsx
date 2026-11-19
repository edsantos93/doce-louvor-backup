"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removerAnunciante, salvarAnunciante } from "@/app/admin/acoes";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  MailIcon,
  PlusIcon,
  TrashIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import type { Advertiser, AdStatus } from "@/lib/types";

export interface AdHistoryEntry {
  id: string;
  label: string;
  period: string;
  value: string;
  status: AdStatus;
}

interface AdvertisersManagerProps {
  advertisers: Advertiser[];
  /** Peças já contratadas por cada anunciante. */
  history: Record<string, AdHistoryEntry[]>;
}

const campo =
  "w-full rounded-[var(--dm-radius-sm)] border border-line bg-surface-raised px-3.5 py-3.5 text-base text-strong outline-none transition-colors focus:border-gold-500";

export function AdvertisersManager({
  advertisers,
  history,
}: AdvertisersManagerProps) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  const [apagados, setApagados] = useState<string[]>([]);
  const lista = advertisers.filter((item) => !apagados.includes(item.id));
  const [formAberto, setFormAberto] = useState(false);
  const [novo, setNovo] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    city: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [paraApagar, setParaApagar] = useState<Advertiser | null>(null);

  function cadastrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (novo.name.trim().length < 2) {
      setErro("Escreva o nome da loja.");
      return;
    }
    if (!novo.phone.trim() && !novo.email.trim()) {
      setErro("Informe pelo menos um contato: telefone ou e-mail.");
      return;
    }

    const dados = new FormData();
    dados.set("nome", novo.name);
    dados.set("contato", novo.contactName);
    dados.set("telefone", novo.phone);
    dados.set("email", novo.email);
    dados.set("cidade", novo.city);

    iniciar(async () => {
      const resposta = await salvarAnunciante(dados);
      if (!resposta.ok) {
        setErro(resposta.erro ?? "Não consegui salvar.");
        return;
      }
      setNovo({ name: "", contactName: "", phone: "", email: "", city: "" });
      setErro(null);
      setFormAberto(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {formAberto ? (
        <form
          onSubmit={cadastrar}
          noValidate
          className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6"
        >
          <h2 className="font-display text-xl text-strong">Novo anunciante</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", "Nome da loja", "Padaria Pão Quente"],
                ["contactName", "Pessoa de contato", "Sebastião Almeida"],
                ["phone", "Telefone ou WhatsApp", "(11) 98812-4471"],
                ["email", "E-mail", "contato@loja.com.br"],
                ["city", "Cidade", "São Paulo, SP"],
              ] as const
            ).map(([chave, rotulo, exemplo]) => (
              <div key={chave}>
                <label
                  htmlFor={`anunciante-${chave}`}
                  className="mb-1.5 block text-sm font-semibold text-strong"
                >
                  {rotulo}
                </label>
                <input
                  id={`anunciante-${chave}`}
                  value={novo[chave]}
                  onChange={(evento) =>
                    setNovo((atual) => ({
                      ...atual,
                      [chave]: evento.target.value,
                    }))
                  }
                  placeholder={exemplo}
                  className={campo}
                />
              </div>
            ))}
          </div>

          {erro ? (
            <p role="alert" className="mt-3 text-sm font-medium text-danger">
              {erro}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setFormAberto(false);
                setErro(null);
              }}
              className="rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300 disabled:opacity-60"
            >
              {enviando ? "Salvando…" : "Salvar anunciante"}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setFormAberto(true)}
          className="inline-flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300"
        >
          <PlusIcon className="size-5" />
          Novo anunciante
        </button>
      )}

      <ul className="grid gap-4 lg:grid-cols-2">
        {lista.map((anunciante) => {
          const historico = history[anunciante.id] ?? [];

          return (
            <li
              key={anunciante.id}
              className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl text-strong">
                    {anunciante.name}
                  </h2>
                  <p className="text-sm text-muted">
                    {anunciante.contactName}
                    {anunciante.city ? ` · ${anunciante.city}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setParaApagar(anunciante)}
                  aria-label={`Apagar ${anunciante.name}`}
                  className="grid size-10 shrink-0 place-items-center rounded-[var(--dm-radius-sm)] border border-line-strong text-danger transition-colors hover:bg-danger-soft"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {anunciante.phone ? (
                  <a
                    href={`https://wa.me/55${anunciante.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-sm font-medium text-strong transition-colors hover:bg-surface-sunken"
                  >
                    <WhatsAppIcon className="size-4" />
                    {anunciante.phone}
                  </a>
                ) : null}
                {anunciante.email ? (
                  <a
                    href={`mailto:${anunciante.email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-sm font-medium text-strong transition-colors hover:bg-surface-sunken"
                  >
                    <MailIcon className="size-4" />
                    {anunciante.email}
                  </a>
                ) : null}
              </div>

              <div className="mt-4 border-t border-line-soft pt-3">
                <h3 className="text-sm font-semibold text-strong">
                  Propagandas contratadas
                </h3>
                {historico.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {historico.map((linha) => (
                      <li
                        key={linha.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-strong">
                            {linha.label}
                          </span>
                          <span className="block text-xs text-muted">
                            {linha.period} · {linha.value}
                          </span>
                        </span>
                        <StatusBadge status={linha.status} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted">
                    Ainda não contratou nenhuma propaganda.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={Boolean(paraApagar)}
        title="Apagar este anunciante?"
        message={
          paraApagar
            ? `${paraApagar.name} sai da lista junto com o histórico de propagandas. Não dá para desfazer.`
            : ""
        }
        onConfirm={() => {
          if (paraApagar) {
            const id = paraApagar.id;
            setApagados((atual) => [...atual, id]);
            iniciar(async () => {
              await removerAnunciante(id);
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
