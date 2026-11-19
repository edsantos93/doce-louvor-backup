"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmarPagamento, gerarCobranca } from "@/app/admin/acoes";
import { CopyField } from "@/components/admin/CopyField";
import { PaymentBadge } from "@/components/admin/StatusBadge";
import { CheckIcon, PixIcon } from "@/components/ui/icons";
import { formatBRL } from "@/lib/format";
import { pixCodeExemplo } from "@/lib/mock/pagamentos";
import type { PaymentStatus } from "@/lib/status";
import type { Advertiser } from "@/lib/types";

const campo =
  "w-full rounded-[var(--dm-radius-sm)] border border-line bg-surface-raised px-3.5 py-3.5 text-base text-strong outline-none transition-colors focus:border-gold-500";

/**
 * Gera a cobrança por PIX de um anunciante.
 * O QR e o código são de demonstração; a integração com o Mercado Pago
 * entra quando as credenciais da conta forem ligadas.
 */
interface PaymentGeneratorProps {
  anunciantes: Advertiser[];
}

export function PaymentGenerator({ anunciantes }: PaymentGeneratorProps) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  const [cobrancaId, setCobrancaId] = useState<string | null>(null);
  const [anunciante, setAnunciante] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [gerada, setGerada] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>("aguardando");

  const nomeAnunciante = anunciantes.find(
    (item) => item.id === anunciante,
  )?.name;

  function gerar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!anunciante) {
      setErro("Escolha para quem é a cobrança.");
      return;
    }
    if (descricao.trim().length < 3) {
      setErro("Escreva o que está sendo cobrado.");
      return;
    }
    if (valor === "" || Number(valor) <= 0) {
      setErro("Informe o valor da cobrança.");
      return;
    }

    const dados = new FormData();
    dados.set("anunciante", anunciante);
    dados.set("descricao", descricao);
    dados.set("valor", valor);

    iniciar(async () => {
      const resposta = await gerarCobranca(dados);
      if (!resposta.ok) {
        setErro(resposta.erro ?? "Não consegui gerar a cobrança.");
        return;
      }
      setErro(null);
      setStatus("aguardando");
      setGerada(true);
      setCobrancaId(null);
      router.refresh();
    });
  }

  if (gerada) {
    return (
      <div className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 shadow-[var(--shadow-card)] sm:p-7">
        <div className="grid gap-7 md:grid-cols-[16rem_minmax(0,1fr)] md:items-start">
          <div className="mx-auto w-full max-w-64">
            <div className="rounded-[var(--dm-radius-md)] border border-line bg-white p-3">
              <Image
                src="/mock/pix-qr.png"
                alt="Código QR do PIX para pagamento da propaganda"
                width={512}
                height={512}
                className="h-auto w-full"
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted">
              O anunciante aponta a câmera do banco para este código.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl text-strong">
                Cobrança gerada
              </h2>
              <PaymentBadge status={status} />
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted">Anunciante</dt>
                <dd className="font-semibold text-strong">{nomeAnunciante}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Referente a</dt>
                <dd className="font-semibold text-strong">{descricao}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Valor</dt>
                <dd className="font-semibold text-strong">
                  {formatBRL(Math.round(Number(valor) * 100))}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <CopyField
                label="Código copia e cola (mande pelo WhatsApp)"
                value={pixCodeExemplo}
              />
            </div>

            <p className="mt-5 rounded-[var(--dm-radius-md)] bg-surface-sunken px-4 py-3 text-sm text-body">
              Quando o pagamento cair, o status muda sozinho e o banner do
              anunciante entra no ar na data combinada.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setGerada(false);
                  setAnunciante("");
                  setDescricao("");
                  setValor("");
                }}
                className="rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
              >
                Gerar outra cobrança
              </button>
              <button
                type="button"
                onClick={() =>
                  iniciar(async () => {
                    setStatus("pago");
                    if (cobrancaId) await confirmarPagamento(cobrancaId);
                    router.refresh();
                  })
                }
                disabled={status === "pago"}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300 disabled:opacity-60"
              >
                <CheckIcon className="size-5" />
                {status === "pago"
                  ? "Pagamento confirmado"
                  : "Marcar como pago"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={gerar}
      noValidate
      className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 shadow-[var(--shadow-card)] sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-gold-100 text-gold-700">
          <PixIcon className="size-6" />
        </span>
        <div>
          <h2 className="font-display text-xl text-strong">
            Cobrar um anunciante
          </h2>
          <p className="text-sm text-muted">
            Gera o QR do PIX para você mandar pelo WhatsApp.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="cobranca-anunciante"
            className="mb-1.5 block text-sm font-semibold text-strong"
          >
            Anunciante
          </label>
          <select
            id="cobranca-anunciante"
            value={anunciante}
            onChange={(evento) => setAnunciante(evento.target.value)}
            className={campo}
          >
            <option value="">Escolha o anunciante</option>
            {anunciantes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="cobranca-descricao"
            className="mb-1.5 block text-sm font-semibold text-strong"
          >
            Referente a
          </label>
          <input
            id="cobranca-descricao"
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            placeholder="Banner no topo — setembro"
            className={campo}
          />
        </div>

        <div>
          <label
            htmlFor="cobranca-valor"
            className="mb-1.5 block text-sm font-semibold text-strong"
          >
            Valor (R$)
          </label>
          <input
            id="cobranca-valor"
            type="number"
            inputMode="decimal"
            min={0}
            step={10}
            value={valor}
            onChange={(evento) => setValor(evento.target.value)}
            placeholder="180,00"
            className={campo}
          />
        </div>
      </div>

      {erro ? (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {erro}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className="mt-5 w-full rounded-[var(--dm-radius-sm)] bg-gold-400 px-6 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300 disabled:opacity-60 sm:w-auto"
      >
        {enviando ? "Gerando…" : "Gerar cobrança PIX"}
      </button>
    </form>
  );
}
