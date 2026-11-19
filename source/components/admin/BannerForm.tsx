"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { salvarBanner } from "@/app/admin/acoes";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { PlacementPreview } from "@/components/admin/PlacementPreview";
import { ScheduleFields } from "@/components/admin/ScheduleFields";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";
import { AD_SPECS, BAND_LABEL } from "@/lib/ads";
import { formatDate } from "@/lib/format";
import type { AdSlotId, Advertiser, BandPosition } from "@/lib/types";

/** Nomes das posições sem termo técnico, do jeito que o cliente fala. */
const NOME_DA_POSICAO: Partial<Record<AdSlotId, string>> = {
  "topo-banner": "Banner rotativo do topo",
  "rodape-banner": "Banner rotativo do rodapé",
  "destaque-1": "Destaque da loja — 1º espaço",
  "destaque-2": "Destaque da loja — 2º espaço",
  "feed-inline": "Banner no meio das matérias",
};

const GRUPOS: { titulo: string; band: BandPosition | null }[] = [
  { titulo: "Faixa do topo", band: "topo" },
  { titulo: "Faixa do rodapé", band: "rodape" },
  { titulo: "Dentro do conteúdo", band: null },
];

const campo =
  "w-full rounded-[var(--dm-radius-sm)] border border-line bg-surface-raised px-3.5 py-3.5 text-base text-strong outline-none transition-colors focus:border-gold-500";

interface Erros {
  imagem?: string;
  anunciante?: string;
  posicao?: string;
  periodo?: string;
  valor?: string;
}

interface BannerFormProps {
  anunciantes: Advertiser[];
  /** Medida da faixa, conforme o formato escolhido em Configurações. */
  medidaDaFaixa: string;
}

export function BannerForm({ anunciantes, medidaDaFaixa }: BannerFormProps) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [anunciante, setAnunciante] = useState("");
  const [posicao, setPosicao] = useState<AdSlotId | "">("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [valor, setValor] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [salvo, setSalvo] = useState(false);
  const [resumo, setResumo] = useState<string | null>(null);

  const spec = posicao ? AD_SPECS[posicao] : null;

  function salvar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const encontrados: Erros = {};

    if (!preview) encontrados.imagem = "Envie a arte do banner.";
    if (!anunciante) encontrados.anunciante = "Escolha de quem é a propaganda.";
    if (!posicao) encontrados.posicao = "Escolha onde ela vai aparecer.";
    if (!inicio || !fim) {
      encontrados.periodo = "Preencha a data de início e a de fim.";
    } else if (fim < inicio) {
      encontrados.periodo =
        "A data de fim não pode ser antes da data de início.";
    }
    if (valor === "" || Number(valor) < 0) {
      encontrados.valor = "Informe quanto o anunciante vai pagar.";
    }

    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) {
      // o erro pode estar lá em cima: leva a pessoa até ele
      setResumo(Object.values(encontrados).filter(Boolean).join(" "));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setResumo(null);

    const nome =
      anunciantes.find((item) => item.id === anunciante)?.name ?? "anunciante";

    const dados = new FormData();
    if (arquivo) dados.set("arquivo", arquivo);
    dados.set("anunciante", anunciante);
    dados.set("posicao", posicao);
    dados.set("inicio", inicio);
    dados.set("fim", fim);
    dados.set("valor", valor);
    dados.set("alt", `Propaganda de ${nome}`);

    iniciar(async () => {
      const resposta = await salvarBanner(dados);
      if (resposta.ok) {
        setSalvo(true);
        router.refresh();
      } else {
        setErros({ imagem: resposta.erro });
        setResumo(resposta.erro ?? "Não consegui salvar.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (salvo) {
    const nomeAnunciante = anunciantes.find(
      (item) => item.id === anunciante,
    )?.name;

    return (
      <div className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success">
          <CheckIcon className="size-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-strong">
          Banner agendado!
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-base text-body">
          A propaganda de <strong className="text-strong">{nomeAnunciante}</strong>{" "}
          entra sozinha em <strong className="text-strong">{formatDate(inicio)}</strong>{" "}
          e sai sozinha em{" "}
          <strong className="text-strong">{formatDate(fim)}</strong>. Você não
          precisa fazer mais nada.
        </p>

        <div className="mt-6 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Link
            href="/admin/banners"
            className="rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
          >
            Ver a lista de banners
          </Link>
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setArquivo(null);
              setAnunciante("");
              setPosicao("");
              setInicio("");
              setFim("");
              setValor("");
              setSalvo(false);
            }}
            className="rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300"
          >
            Cadastrar outro banner
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={salvar}
      noValidate
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]"
    >
      <div className="space-y-6">
        {resumo ? (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-danger-soft px-4 py-3 text-base font-semibold text-danger"
          >
            <AlertIcon className="size-5 shrink-0" />
            {resumo}
          </p>
        ) : null}

        <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
          <h2 className="font-display text-xl text-strong">
            1. A arte da propaganda
          </h2>
          <p className="mt-1 text-sm text-muted">
            É a imagem que o ouvinte vai ver no site.
          </p>
          <div className="mt-4">
            <ImageDropzone
              value={preview}
              onChange={(url, escolhido) => {
                setPreview(url);
                setArquivo(escolhido);
                setErros((atual) => ({ ...atual, imagem: undefined }));
              }}
              recommended={
                spec && spec.kind !== "banner"
                  ? spec.recommended
                  : medidaDaFaixa
              }
              error={erros.imagem}
            />
          </div>
        </section>

        <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
          <h2 className="font-display text-xl text-strong">
            2. De quem é e onde entra
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="anunciante"
                className="mb-1.5 block text-sm font-semibold text-strong"
              >
                Anunciante
              </label>
              <select
                id="anunciante"
                value={anunciante}
                onChange={(evento) => setAnunciante(evento.target.value)}
                aria-invalid={Boolean(erros.anunciante)}
                aria-describedby={erros.anunciante ? "erro-anunciante" : undefined}
                className={campo}
              >
                <option value="">Escolha o anunciante</option>
                {anunciantes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {erros.anunciante ? (
                <p id="erro-anunciante" role="alert" className="mt-1.5 text-sm text-danger">
                  {erros.anunciante}
                </p>
              ) : null}
              <p className="mt-1.5 text-xs text-muted">
                Não achou a loja?{" "}
                <Link href="/admin/anunciantes" className="font-semibold text-[var(--text-link)] underline">
                  Cadastre o anunciante
                </Link>
                .
              </p>
            </div>

            <div>
              <label
                htmlFor="posicao"
                className="mb-1.5 block text-sm font-semibold text-strong"
              >
                Posição no site
              </label>
              <select
                id="posicao"
                value={posicao}
                onChange={(evento) => setPosicao(evento.target.value as AdSlotId)}
                aria-invalid={Boolean(erros.posicao)}
                aria-describedby={erros.posicao ? "erro-posicao" : "dica-posicao"}
                className={campo}
              >
                <option value="">Escolha a posição</option>
                {GRUPOS.map((grupo) => (
                  <optgroup key={grupo.titulo} label={grupo.titulo}>
                    {(Object.keys(AD_SPECS) as AdSlotId[])
                      .filter(
                        (id) =>
                          AD_SPECS[id].kind !== "adsense" &&
                          AD_SPECS[id].band === grupo.band,
                      )
                      .map((id) => (
                        <option key={id} value={id}>
                          {NOME_DA_POSICAO[id]}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              {erros.posicao ? (
                <p id="erro-posicao" role="alert" className="mt-1.5 text-sm text-danger">
                  {erros.posicao}
                </p>
              ) : (
                <p id="dica-posicao" className="mt-1.5 text-xs text-muted">
                  {spec
                    ? `${BAND_LABEL[spec.band ?? "topo"]} · imagem de ${spec.recommended}`
                    : "Os espaços do Google AdSense são preenchidos sozinhos."}
                </p>
              )}
            </div>
          </div>
        </section>

        <ScheduleFields
          start={inicio}
          end={fim}
          onChange={(nome, valorNovo) => {
            if (nome === "start") setInicio(valorNovo);
            else setFim(valorNovo);
            setErros((atual) => ({ ...atual, periodo: undefined }));
          }}
          error={erros.periodo}
        />

        <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
          <h2 className="font-display text-xl text-strong">
            4. Quanto o anunciante paga
          </h2>
          <div className="mt-4 max-w-xs">
            <label
              htmlFor="valor"
              className="mb-1.5 block text-sm font-semibold text-strong"
            >
              Valor do período
            </label>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-muted">R$</span>
              <input
                id="valor"
                type="number"
                inputMode="decimal"
                min={0}
                step={10}
                placeholder="180,00"
                value={valor}
                onChange={(evento) => setValor(evento.target.value)}
                aria-invalid={Boolean(erros.valor)}
                aria-describedby={erros.valor ? "erro-valor" : undefined}
                className={campo}
              />
            </div>
            {erros.valor ? (
              <p id="erro-valor" role="alert" className="mt-1.5 text-sm text-danger">
                {erros.valor}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-muted">
                A cobrança por PIX é gerada na tela de Pagamentos.
              </p>
            )}
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <Link
            href="/admin/banners"
            className="rounded-[var(--dm-radius-sm)] border border-line-strong px-6 py-3.5 text-center text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-[var(--dm-radius-sm)] bg-gold-400 px-6 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300 disabled:opacity-60"
          >
            {enviando ? "Salvando…" : "Salvar e agendar banner"}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-sunken p-4">
          <h2 className="font-display text-lg text-strong">
            Onde vai aparecer
          </h2>
          <div className="mt-3">
            <PlacementPreview slot={posicao} previewUrl={preview} />
          </div>
        </div>
      </aside>
    </form>
  );
}
