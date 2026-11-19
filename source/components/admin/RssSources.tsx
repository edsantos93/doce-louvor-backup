"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  atualizarNoticias,
  pausarOuAtivarFonte,
  removerFonte,
  salvarFonte,
} from "@/app/admin/acoes";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PlusIcon, RefreshIcon, RssIcon, TrashIcon } from "@/components/ui/icons";
import { formatDate, formatTime } from "@/lib/format";
import type { RssSource } from "@/lib/types";

interface RssSourcesProps {
  sources: RssSource[];
}

const campo =
  "w-full rounded-[var(--dm-radius-sm)] border border-line bg-surface-raised px-3.5 py-3.5 text-base text-strong outline-none transition-colors focus:border-gold-500";

export function RssSources({ sources }: RssSourcesProps) {
  const router = useRouter();
  const [, iniciar] = useTransition();
  const [lista, setLista] = useState(sources);
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [categoria, setCategoria] = useState("Cidade");
  const [erro, setErro] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState(false);
  const [paraApagar, setParaApagar] = useState<RssSource | null>(null);
  const [resumoBusca, setResumoBusca] = useState<string | null>(null);

  function adicionar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (nome.trim().length < 2) {
      setErro("Escreva o nome do site de notícias.");
      return;
    }
    if (!/^https?:\/\/.+/.test(endereco.trim())) {
      setErro("O endereço precisa começar com http:// ou https://");
      return;
    }

    const dados = new FormData();
    dados.set("nome", nome);
    dados.set("url", endereco);
    dados.set("categoria", categoria);

    iniciar(async () => {
      const resposta = await salvarFonte(dados);
      if (!resposta.ok) {
        setErro(resposta.erro ?? "Não consegui salvar.");
        return;
      }
      setLista((atual) => [
        ...atual,
        {
          id: `rss-${Date.now()}`,
          name: nome.trim(),
          url: endereco.trim(),
          category: categoria,
          lastSyncAt: new Date().toISOString(),
          active: true,
          itemCount: 0,
        },
      ]);
      setNome("");
      setEndereco("");
      setErro(null);
      router.refresh();
    });
  }

  function atualizarAgora() {
    setAtualizando(true);
    iniciar(async () => {
      const resposta = await atualizarNoticias();
      setResumoBusca(resposta.resumo ?? null);
      setAtualizando(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised">
        <div className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-display text-xl text-strong">
              Sites que alimentam a coluna de notícias
            </h2>
            <p className="mt-1 text-sm text-muted">
              As notícias entram sozinhas. Use o botão só se quiser buscar na
              hora.
            </p>
          </div>
          <button
            type="button"
            onClick={atualizarAgora}
            disabled={atualizando}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300 disabled:opacity-60"
          >
            <RefreshIcon
              className={`size-5 ${atualizando ? "animate-spin" : ""}`}
            />
            {atualizando ? "Buscando…" : "Atualizar agora"}
          </button>
        </div>

        {resumoBusca ? (
          <p
            role="status"
            className="border-b border-line-soft bg-success-soft px-4 py-3 text-sm font-medium text-success sm:px-5"
          >
            {resumoBusca}
          </p>
        ) : null}

        <ul className="divide-y divide-line-soft">
          {lista.map((fonte) => (
            <li
              key={fonte.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex min-w-0 gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-700">
                  <RssIcon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-strong">
                    {fonte.name}
                    <span className="ml-2 rounded-full bg-cream-200 px-2 py-0.5 text-xs font-medium text-muted">
                      {fonte.category}
                    </span>
                  </p>
                  <p className="truncate text-sm text-muted">{fonte.url}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {fonte.active
                      ? `Última busca: ${formatDate(fonte.lastSyncAt)} às ${formatTime(fonte.lastSyncAt)} · ${fonte.itemCount} notícias`
                      : "Pausado — não está trazendo notícias."}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLista((atual) =>
                      atual.map((linha) =>
                        linha.id === fonte.id
                          ? { ...linha, active: !linha.active }
                          : linha,
                      ),
                    );
                    iniciar(async () => {
                      await pausarOuAtivarFonte(fonte.id);
                      router.refresh();
                    });
                  }}
                  className="rounded-[var(--dm-radius-sm)] border border-line-strong px-4 py-2.5 text-sm font-semibold text-strong transition-colors hover:bg-surface-sunken"
                >
                  {fonte.active ? "Pausar" : "Ativar"}
                </button>
                <button
                  type="button"
                  onClick={() => setParaApagar(fonte)}
                  aria-label={`Remover ${fonte.name}`}
                  className="grid size-10 place-items-center rounded-[var(--dm-radius-sm)] border border-line-strong text-danger transition-colors hover:bg-danger-soft"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
        <h2 className="font-display text-xl text-strong">
          Adicionar outro site
        </h2>
        <p className="mt-1 text-sm text-muted">
          Cole o endereço do feed do site (normalmente termina em /feed ou /rss).
        </p>

        <form onSubmit={adicionar} noValidate className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="fonte-nome"
              className="mb-1.5 block text-sm font-semibold text-strong"
            >
              Nome do site
            </label>
            <input
              id="fonte-nome"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              placeholder="Diário da Região"
              className={campo}
            />
          </div>

          <div>
            <label
              htmlFor="fonte-url"
              className="mb-1.5 block text-sm font-semibold text-strong"
            >
              Endereço do feed
            </label>
            <input
              id="fonte-url"
              type="url"
              value={endereco}
              onChange={(evento) => setEndereco(evento.target.value)}
              placeholder="https://exemplo.com.br/feed"
              className={campo}
            />
          </div>

          <div>
            <label
              htmlFor="fonte-categoria"
              className="mb-1.5 block text-sm font-semibold text-strong"
            >
              Assunto
            </label>
            <select
              id="fonte-categoria"
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              className={campo}
            >
              <option>Cidade</option>
              <option>Esportes</option>
              <option>Cultura</option>
              <option>Economia</option>
              <option>Previsão do tempo</option>
            </select>
          </div>

          {erro ? (
            <p role="alert" className="text-sm font-medium text-danger sm:col-span-3">
              {erro}
            </p>
          ) : null}

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-ink-950 px-5 py-3 text-base font-semibold text-cream-50 transition-opacity hover:opacity-90"
            >
              <PlusIcon className="size-5" />
              Adicionar site
            </button>
          </div>
        </form>
      </section>

      <ConfirmDialog
        open={Boolean(paraApagar)}
        title="Remover este site?"
        message={
          paraApagar
            ? `As notícias de ${paraApagar.name} deixam de aparecer no site.`
            : ""
        }
        confirmLabel="Sim, remover"
        onConfirm={() => {
          if (paraApagar) {
            const id = paraApagar.id;
            setLista((atual) => atual.filter((fonte) => fonte.id !== id));
            iniciar(async () => {
              await removerFonte(id);
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
