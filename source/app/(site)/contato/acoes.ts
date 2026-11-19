"use server";

import { db, novoId } from "@/lib/db";
import { enviarPorEmail } from "@/lib/email";

export interface RespostaContato {
  ok: boolean;
  erro?: string;
}

/**
 * Guarda a mensagem do ouvinte e manda por e-mail.
 * A mensagem é salva primeiro: mesmo que o e-mail falhe, ela aparece na
 * tela de Mensagens do painel.
 */
export async function enviarMensagem(
  form: FormData,
): Promise<RespostaContato> {
  const nome = String(form.get("nome") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const assunto = String(form.get("assunto") ?? "").trim();
  const texto = String(form.get("mensagem") ?? "").trim();

  if (nome.length < 2) return { ok: false, erro: "Escreva seu nome." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, erro: "Confira o e-mail." };
  }
  if (!assunto) return { ok: false, erro: "Escolha o assunto." };
  if (texto.length < 10) {
    return { ok: false, erro: "Escreva um pouco mais na mensagem." };
  }

  const id = novoId("msg");
  db.prepare(
    `INSERT INTO mensagens (id, nome, email, assunto, mensagem, criado_em, lida, enviada)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
  ).run(id, nome, email, assunto, texto, new Date().toISOString());

  try {
    const enviada = await enviarPorEmail({ nome, email, assunto, texto });
    if (enviada) {
      db.prepare("UPDATE mensagens SET enviada = 1 WHERE id = ?").run(id);
    }
  } catch {
    // O e-mail pode falhar; a mensagem já está guardada no painel.
  }

  return { ok: true };
}
