import "server-only";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

/**
 * Configurações que o cliente muda pelo painel, sem depender de programador:
 * endereço do stream, contatos e os textos que o Google lê.
 */
export interface Configuracoes {
  /** Nome da rádio, usado nos títulos e na ficha do Google. */
  nomeDaRadio: string;
  /** Endereço oficial do site, com https e sem barra no fim. */
  siteUrl: string;
  /** Endereço do stream da BR Logic que o player toca. */
  streamUrl: string;
  /** Código do player da BR Logic (o <iframe> que eles entregam). */
  playerEmbed: string;
  /** Endereço que informa a música tocando (descoberto pelo player). */
  statusUrl: string;
  /** Formato da faixa de anúncio: fino, medio ou grande. */
  bannerFormato: string;
  /** Para onde vão as mensagens do formulário de contato. */
  emailDestino: string;
  smtpHost: string;
  smtpPorta: string;
  smtpUsuario: string;
  smtpSenha: string;
  /** WhatsApp com DDI e DDD, só números. */
  whatsapp: string;
  whatsappMensagem: string;
  email: string;
  instagram: string;
  facebook: string;
  youtube: string;
  /** Título que aparece na aba do navegador e no Google. */
  seoTitulo: string;
  seoDescricao: string;
  /** Palavras-chave, separadas por vírgula. */
  seoPalavras: string;
  /** Código que o Google Search Console pede para provar que o site é seu. */
  googleVerificacao: string;
  /** Medição do Google Analytics, no formato G-XXXXXXXXXX. */
  googleAnalytics: string;
  /** Segundos de cada anunciante no banner rotativo. */
  bannerSegundos: string;
}

const PADRAO: Configuracoes = {
  nomeDaRadio: site.name,
  siteUrl: site.url,
  streamUrl: "",
  playerEmbed: "",
  statusUrl: "",
  bannerFormato: "medio",
  emailDestino: "",
  smtpHost: "smtp.hostinger.com",
  smtpPorta: "465",
  smtpUsuario: "",
  smtpSenha: "",
  whatsapp: "",
  whatsappMensagem: site.whatsappMessage,
  email: site.email,
  instagram: "",
  facebook: "",
  youtube: "",
  seoTitulo: `${site.name} — ${site.slogan}`,
  seoDescricao: site.description,
  seoPalavras:
    "rádio online, rádio ao vivo, Doce Melodia, música brasileira, notícias",
  googleVerificacao: "",
  googleAnalytics: "",
  bannerSegundos: String(site.bannerRotationSeconds),
};

export function obterConfig(): Configuracoes {
  const linhas = db
    .prepare("SELECT chave, valor FROM configuracoes")
    .all() as { chave: string; valor: string }[];

  const guardado = Object.fromEntries(
    linhas.map((linha) => [linha.chave, linha.valor]),
  ) as Partial<Configuracoes>;

  return { ...PADRAO, ...guardado };
}

export function salvarConfig(parcial: Partial<Configuracoes>) {
  const gravar = db.prepare(
    `INSERT INTO configuracoes (chave, valor) VALUES (?, ?)
     ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
  );

  const tudo = db.transaction(() => {
    for (const [chave, valor] of Object.entries(parcial)) {
      gravar.run(chave, valor ?? "");
    }
  });

  tudo();
}

/**
 * Do código que a BR Logic entrega, só o endereço do player interessa.
 * Guardar o endereço em vez do HTML inteiro evita injetar código de fora
 * dentro do site.
 */
export function enderecoDoPlayer(codigo: string): string {
  const texto = codigo.trim();
  if (!texto) return "";

  const doIframe = /<iframe[^>]+src=["']([^"']+)["']/i.exec(texto)?.[1];
  const endereco = doIframe ?? texto;

  return /^https:\/\//i.test(endereco) ? endereco.replace(/&amp;/g, "&") : "";
}

/** Só os números do WhatsApp, do jeito que o wa.me aceita. */
export function whatsappLimpo(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  if (!digitos) return "";
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}
