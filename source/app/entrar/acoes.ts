"use server";

import { redirect } from "next/navigation";
import {
  autenticar,
  contarUsuarios,
  criarUsuario,
  encerrarSessao,
  iniciarSessao,
} from "@/lib/auth";

export interface EstadoLogin {
  erro?: string;
}

export async function entrar(
  _estado: EstadoLogin,
  form: FormData,
): Promise<EstadoLogin> {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Preencha o e-mail e a senha." };
  }

  const usuario = autenticar(email, senha);
  if (!usuario) {
    return { erro: "E-mail ou senha não conferem. Tente de novo." };
  }

  await iniciarSessao(usuario);
  redirect("/admin");
}

/** Só funciona enquanto não existe nenhum usuário: é o primeiro acesso. */
export async function criarPrimeiroAcesso(
  _estado: EstadoLogin,
  form: FormData,
): Promise<EstadoLogin> {
  if (contarUsuarios() > 0) {
    return { erro: "O acesso já foi criado. Use o e-mail e a senha." };
  }

  const nome = String(form.get("nome") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  const confirmacao = String(form.get("confirmacao") ?? "");

  if (nome.length < 2) return { erro: "Escreva seu nome." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { erro: "Confira o e-mail: parece estar incompleto." };
  }
  if (senha.length < 8) {
    return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  }
  if (senha !== confirmacao) {
    return { erro: "As duas senhas não são iguais." };
  }

  const usuario = criarUsuario({ nome, email, senha });
  await iniciarSessao(usuario);
  redirect("/admin");
}

export async function sair() {
  await encerrarSessao();
  redirect("/entrar");
}
