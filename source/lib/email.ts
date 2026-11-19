import "server-only";
import nodemailer from "nodemailer";
import { obterConfig } from "@/lib/configuracoes";

/**
 * Envio das mensagens do formulário de contato.
 * Enquanto o e-mail não estiver configurado no painel, a mensagem continua
 * salva no banco e aparece na tela de Mensagens — nada se perde.
 */
export async function enviarPorEmail(mensagem: {
  nome: string;
  email: string;
  assunto: string;
  texto: string;
}): Promise<boolean> {
  const config = obterConfig();
  const destino = config.emailDestino || config.email;

  if (!config.smtpHost || !config.smtpUsuario || !config.smtpSenha || !destino) {
    return false;
  }

  const porta = Number(config.smtpPorta) || 465;

  const transporte = nodemailer.createTransport({
    host: config.smtpHost,
    port: porta,
    secure: porta === 465,
    auth: { user: config.smtpUsuario, pass: config.smtpSenha },
  });

  await transporte.sendMail({
    from: `"Site Doce Melodia" <${config.smtpUsuario}>`,
    to: destino,
    replyTo: `"${mensagem.nome}" <${mensagem.email}>`,
    subject: `[Site] ${mensagem.assunto} — ${mensagem.nome}`,
    text: [
      `Assunto: ${mensagem.assunto}`,
      `Nome: ${mensagem.nome}`,
      `E-mail: ${mensagem.email}`,
      "",
      mensagem.texto,
      "",
      "— enviado pelo formulário do site docemelodia.net",
    ].join("\n"),
  });

  return true;
}

/** Confere se dá para enviar e-mail com o que está configurado. */
export async function testarEnvio(): Promise<string | null> {
  const config = obterConfig();
  if (!config.smtpHost || !config.smtpUsuario || !config.smtpSenha) {
    return "Faltam os dados do e-mail (servidor, usuário e senha).";
  }

  try {
    const porta = Number(config.smtpPorta) || 465;
    const transporte = nodemailer.createTransport({
      host: config.smtpHost,
      port: porta,
      secure: porta === 465,
      auth: { user: config.smtpUsuario, pass: config.smtpSenha },
    });
    await transporte.verify();
    return null;
  } catch (erro) {
    return erro instanceof Error ? erro.message : "Não consegui conectar.";
  }
}
