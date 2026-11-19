"use client";

import { useActionState } from "react";
import {
  criarPrimeiroAcesso,
  entrar,
  type EstadoLogin,
} from "@/app/entrar/acoes";
import { AlertIcon } from "@/components/ui/icons";

interface LoginFormProps {
  /** Sem nenhum usuário cadastrado, a tela vira "criar seu acesso". */
  primeiroAcesso: boolean;
}

const campo =
  "w-full rounded-[var(--dm-radius-sm)] border border-line bg-surface-raised px-3.5 py-3.5 text-base text-strong outline-none transition-colors focus:border-gold-500";

export function LoginForm({ primeiroAcesso }: LoginFormProps) {
  const acao = primeiroAcesso ? criarPrimeiroAcesso : entrar;
  const [estado, enviar, pendente] = useActionState<EstadoLogin, FormData>(
    acao,
    {},
  );

  return (
    <form action={enviar} className="space-y-4">
      {primeiroAcesso ? (
        <div>
          <label
            htmlFor="nome"
            className="mb-1.5 block text-sm font-semibold text-strong"
          >
            Seu nome
          </label>
          <input
            id="nome"
            name="nome"
            autoComplete="name"
            placeholder="Leandro"
            className={campo}
          />
        </div>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-semibold text-strong"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="voce@docemelodia.net"
          className={campo}
        />
      </div>

      <div>
        <label
          htmlFor="senha"
          className="mb-1.5 block text-sm font-semibold text-strong"
        >
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete={primeiroAcesso ? "new-password" : "current-password"}
          className={campo}
        />
        {primeiroAcesso ? (
          <p className="mt-1.5 text-xs text-muted">
            Use pelo menos 8 caracteres. Anote em lugar seguro.
          </p>
        ) : null}
      </div>

      {primeiroAcesso ? (
        <div>
          <label
            htmlFor="confirmacao"
            className="mb-1.5 block text-sm font-semibold text-strong"
          >
            Repita a senha
          </label>
          <input
            id="confirmacao"
            name="confirmacao"
            type="password"
            autoComplete="new-password"
            className={campo}
          />
        </div>
      ) : null}

      {estado.erro ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger"
        >
          <AlertIcon className="size-4 shrink-0" />
          {estado.erro}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendente}
        className="w-full rounded-[var(--dm-radius-sm)] bg-gold-400 px-6 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300 disabled:opacity-60"
      >
        {pendente
          ? "Entrando…"
          : primeiroAcesso
            ? "Criar meu acesso"
            : "Entrar no painel"}
      </button>
    </form>
  );
}
