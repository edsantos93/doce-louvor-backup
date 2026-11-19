"use client";

import { useState, useTransition } from "react";
import { enviarMensagem } from "@/app/(site)/contato/acoes";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";

type Campo = "nome" | "email" | "assunto" | "mensagem";
type Erros = Partial<Record<Campo, string>>;

const ASSUNTOS = [
  "Pedir uma música",
  "Anunciar na rádio",
  "Mandar um recado",
  "Falar com a produção",
  "Outro assunto",
];

const inputBase =
  "w-full rounded-[var(--dm-radius-sm)] border bg-surface-raised px-3.5 py-3 text-base text-strong outline-none transition-colors placeholder:text-ink-400 focus:border-gold-500";

function validar(valores: Record<Campo, string>): Erros {
  const erros: Erros = {};

  if (valores.nome.trim().length < 2) {
    erros.nome = "Escreva seu nome completo.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valores.email.trim())) {
    erros.email = "Confira o e-mail: parece estar incompleto.";
  }
  if (!valores.assunto) {
    erros.assunto = "Escolha o assunto da mensagem.";
  }
  if (valores.mensagem.trim().length < 10) {
    erros.mensagem = "Conte um pouco mais — pelo menos 10 caracteres.";
  }

  return erros;
}

export function ContactForm() {
  const [valores, setValores] = useState<Record<Campo, string>>({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  });
  const [erros, setErros] = useState<Erros>({});
  const [enviado, setEnviado] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function alterar(campo: Campo, valor: string) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) {
      setErros((atual) => ({ ...atual, [campo]: undefined }));
    }
  }

  function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const encontrados = validar(valores);
    setErros(encontrados);

    if (Object.keys(encontrados).length > 0) return;

    const dados = new FormData();
    dados.set("nome", valores.nome);
    dados.set("email", valores.email);
    dados.set("assunto", valores.assunto);
    dados.set("mensagem", valores.mensagem);

    iniciar(async () => {
      const resposta = await enviarMensagem(dados);
      if (resposta.ok) {
        setFalha(null);
        setEnviado(true);
      } else {
        setFalha(resposta.erro ?? "Não consegui enviar. Tente de novo.");
      }
    });
  }

  if (enviado) {
    return (
      <div
        role="status"
        className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-6 text-center shadow-[var(--shadow-card)]"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-success">
          <CheckIcon className="size-6" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-strong">
          Mensagem enviada!
        </h2>
        <p className="mt-2 text-body">
          Obrigado, {valores.nome.split(" ")[0]}. A produção responde no e-mail{" "}
          <strong className="text-strong">{valores.email}</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setValores({ nome: "", email: "", assunto: "", mensagem: "" });
            setEnviado(false);
          }}
          className="mt-5 rounded-[var(--dm-radius-sm)] border border-line-strong px-4 py-2.5 text-sm font-semibold text-strong transition-colors hover:bg-surface-sunken"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={enviar}
      className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 shadow-[var(--shadow-card)] sm:p-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id="nome"
          label="Seu nome"
          erro={erros.nome}
          className="sm:col-span-1"
        >
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            placeholder="Maria da Silva"
            value={valores.nome}
            onChange={(event) => alterar("nome", event.target.value)}
            aria-invalid={Boolean(erros.nome)}
            aria-describedby={erros.nome ? "erro-nome" : undefined}
            className={`${inputBase} ${erros.nome ? "border-danger" : "border-line"}`}
          />
        </Campo>

        <Campo id="email" label="Seu e-mail" erro={erros.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="maria@email.com"
            value={valores.email}
            onChange={(event) => alterar("email", event.target.value)}
            aria-invalid={Boolean(erros.email)}
            aria-describedby={erros.email ? "erro-email" : undefined}
            className={`${inputBase} ${erros.email ? "border-danger" : "border-line"}`}
          />
        </Campo>

        <Campo
          id="assunto"
          label="Assunto"
          erro={erros.assunto}
          className="sm:col-span-2"
        >
          <select
            id="assunto"
            name="assunto"
            value={valores.assunto}
            onChange={(event) => alterar("assunto", event.target.value)}
            aria-invalid={Boolean(erros.assunto)}
            aria-describedby={erros.assunto ? "erro-assunto" : undefined}
            className={`${inputBase} ${erros.assunto ? "border-danger" : "border-line"}`}
          >
            <option value="">Escolha uma opção</option>
            {ASSUNTOS.map((assunto) => (
              <option key={assunto} value={assunto}>
                {assunto}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          id="mensagem"
          label="Mensagem"
          erro={erros.mensagem}
          className="sm:col-span-2"
        >
          <textarea
            id="mensagem"
            name="mensagem"
            rows={6}
            placeholder="Escreva aqui seu recado, pedido de música ou proposta de anúncio."
            value={valores.mensagem}
            onChange={(event) => alterar("mensagem", event.target.value)}
            aria-invalid={Boolean(erros.mensagem)}
            aria-describedby={erros.mensagem ? "erro-mensagem" : undefined}
            className={`${inputBase} resize-y ${erros.mensagem ? "border-danger" : "border-line"}`}
          />
        </Campo>
      </div>

      {falha ? (
        <p
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-danger-soft px-4 py-3 text-sm font-semibold text-danger"
        >
          <AlertIcon className="size-4 shrink-0" />
          {falha}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className="mt-6 w-full rounded-[var(--dm-radius-sm)] bg-gold-400 px-6 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300 disabled:opacity-60 sm:w-auto"
      >
        {enviando ? "Enviando…" : "Enviar mensagem"}
      </button>
      <p className="mt-3 text-xs text-muted">
        Respondemos de segunda a sexta, das 9h às 18h.
      </p>
    </form>
  );
}

interface CampoProps {
  id: string;
  label: string;
  erro?: string;
  className?: string;
  children: React.ReactNode;
}

function Campo({ id, label, erro, className = "", children }: CampoProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-strong"
      >
        {label}
      </label>
      {children}
      {erro ? (
        <p
          id={`erro-${id}`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-sm text-danger"
        >
          <AlertIcon className="size-4 shrink-0" />
          {erro}
        </p>
      ) : null}
    </div>
  );
}
