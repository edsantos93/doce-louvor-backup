"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { salvarPeca } from "@/app/admin/acoes";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { ScheduleFields } from "@/components/admin/ScheduleFields";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import type { Advertiser } from "@/lib/types";

export type TipoDePeca = "slides" | "destaques" | "videos";

interface PecaFormProps {
  tipo: TipoDePeca;
  anunciantes: Advertiser[];
}

const TEXTOS: Record<
  TipoDePeca,
  {
    titulo: string;
    voltar: string;
    imagem: string;
    medida: string;
    tituloCampo: string;
    tituloDica: string;
    /** Vazio quando a peça não tem texto de apoio, como o slide. */
    subtituloCampo: string;
    subtituloDica: string;
    temPeriodo: boolean;
    temLoja: boolean;
    linkDica: string;
  }
> = {
  slides: {
    titulo: "slide",
    voltar: "/admin/slides",
    imagem: "A arte do slide",
    medida: "1280 × 640 px",
    tituloCampo: "Nome do slide",
    tituloDica:
      "Só para você reconhecer na lista do painel. No site aparece apenas a arte.",
    subtituloCampo: "",
    subtituloDica: "",
    temPeriodo: true,
    temLoja: false,
    linkDica: "Para onde o ouvinte vai ao clicar no slide.",
  },
  destaques: {
    titulo: "destaque",
    voltar: "/admin/destaques",
    imagem: "A foto do destaque",
    medida: "800 × 600 px",
    tituloCampo: "Título do destaque",
    tituloDica: "Aparece embaixo da foto, no site.",
    subtituloCampo: "Texto curto",
    subtituloDica: "Duas linhas no máximo, é o que aparece embaixo do título.",
    temPeriodo: true,
    temLoja: true,
    linkDica: "Para onde o ouvinte vai ao clicar. Pode deixar vazio.",
  },
  videos: {
    titulo: "vídeo",
    voltar: "/admin/videos",
    imagem: "A capa do vídeo",
    medida: "640 × 360 px",
    tituloCampo: "Título do vídeo",
    tituloDica: "Aparece embaixo da capa, no site.",
    subtituloCampo: "Duração",
    subtituloDica: "Escreva como no player: 3:45",
    temPeriodo: false,
    temLoja: false,
    linkDica: "Cole aqui o endereço do vídeo no YouTube.",
  },
};

const campo =
  "w-full rounded-[var(--dm-radius-sm)] border border-line bg-surface-raised px-3.5 py-3.5 text-base text-strong outline-none transition-colors focus:border-gold-500";

export function PecaForm({ tipo, anunciantes }: PecaFormProps) {
  const texto = TEXTOS[tipo];
  const router = useRouter();
  const [enviando, iniciar] = useTransition();

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [link, setLink] = useState("");
  const [anunciante, setAnunciante] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!arquivo) return falhar("Envie a imagem.");
    if (titulo.trim().length < 3) return falhar("Escreva o título.");
    if (texto.temPeriodo && (!inicio || !fim)) {
      return falhar("Preencha a data de início e a de fim.");
    }
    if (texto.temPeriodo && fim < inicio) {
      return falhar("A data de fim não pode ser antes da de início.");
    }

    const dados = new FormData();
    dados.set("tipo", tipo);
    dados.set("arquivo", arquivo);
    dados.set("titulo", titulo);
    dados.set("subtitulo", subtitulo);
    dados.set("link", link);
    dados.set("anunciante", anunciante);
    dados.set("inicio", inicio);
    dados.set("fim", fim);

    iniciar(async () => {
      const resposta = await salvarPeca(dados);
      if (resposta.ok) {
        setErro(null);
        setSalvo(true);
        router.refresh();
      } else {
        falhar(resposta.erro ?? "Não consegui salvar.");
      }
    });
  }

  function falhar(mensagem: string) {
    setErro(mensagem);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (salvo) {
    return (
      <div className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success">
          <CheckIcon className="size-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-strong">
          {texto.titulo === "vídeo" ? "Vídeo salvo!" : `${texto.titulo[0].toUpperCase()}${texto.titulo.slice(1)} salvo!`}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-base text-body">
          {texto.temPeriodo
            ? `Já está no site: entra em ${formatDate(inicio)} e sai sozinho em ${formatDate(fim)}.`
            : "Já está aparecendo na faixa de vídeos do site."}
        </p>

        <div className="mt-6 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Link
            href={texto.voltar}
            className="rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
          >
            Ver a lista
          </Link>
          <button
            type="button"
            onClick={() => {
              setArquivo(null);
              setPreview(null);
              setTitulo("");
              setSubtitulo("");
              setLink("");
              setAnunciante("");
              setInicio("");
              setFim("");
              setSalvo(false);
            }}
            className="rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300"
          >
            Cadastrar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="max-w-3xl space-y-6">
      {erro ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-danger-soft px-4 py-3 text-base font-semibold text-danger"
        >
          <AlertIcon className="size-5 shrink-0" />
          {erro}
        </p>
      ) : null}

      <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
        <h2 className="font-display text-xl text-strong">1. {texto.imagem}</h2>
        <div className="mt-4">
          <ImageDropzone
            value={preview}
            onChange={(url, escolhido) => {
              setPreview(url);
              setArquivo(escolhido);
              setErro(null);
            }}
            recommended={texto.medida}
          />
        </div>
      </section>

      <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
        <h2 className="font-display text-xl text-strong">2. O texto</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="titulo"
              className="mb-1.5 block text-sm font-semibold text-strong"
            >
              {texto.tituloCampo}
            </label>
            <input
              id="titulo"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              className={campo}
            />
            <p className="mt-1.5 text-xs text-muted">{texto.tituloDica}</p>
          </div>

          {texto.subtituloCampo ? (
            <div className="sm:col-span-2">
              <label
                htmlFor="subtitulo"
                className="mb-1.5 block text-sm font-semibold text-strong"
              >
                {texto.subtituloCampo}
              </label>
              <input
                id="subtitulo"
                value={subtitulo}
                onChange={(evento) => setSubtitulo(evento.target.value)}
                className={campo}
              />
              <p className="mt-1.5 text-xs text-muted">{texto.subtituloDica}</p>
            </div>
          ) : null}

          <div className={texto.temLoja ? "" : "sm:col-span-2"}>
            <label
              htmlFor="link"
              className="mb-1.5 block text-sm font-semibold text-strong"
            >
              {tipo === "slides" ? "Link do anunciante" : "Link ao clicar"}
            </label>
            <input
              id="link"
              value={link}
              onChange={(evento) => setLink(evento.target.value)}
              placeholder="https://..."
              className={campo}
            />
            <p className="mt-1.5 text-xs text-muted">{texto.linkDica}</p>
          </div>

          {texto.temLoja ? (
            <div>
              <label
                htmlFor="anunciante"
                className="mb-1.5 block text-sm font-semibold text-strong"
              >
                Loja (opcional)
              </label>
              <select
                id="anunciante"
                value={anunciante}
                onChange={(evento) => setAnunciante(evento.target.value)}
                className={campo}
              >
                <option value="">Não é de loja nenhuma</option>
                {anunciantes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted">
                Escolhendo a loja, aparece &quot;Loja parceira&quot; no site.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {texto.temPeriodo ? (
        <ScheduleFields
          start={inicio}
          end={fim}
          onChange={(qual, valor) => {
            if (qual === "start") setInicio(valor);
            else setFim(valor);
            setErro(null);
          }}
        />
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Link
          href={texto.voltar}
          className="rounded-[var(--dm-radius-sm)] border border-line-strong px-6 py-3.5 text-center text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-[var(--dm-radius-sm)] bg-gold-400 px-6 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300 disabled:opacity-60"
        >
          {enviando ? "Salvando…" : `Salvar ${texto.titulo}`}
        </button>
      </div>
    </form>
  );
}
