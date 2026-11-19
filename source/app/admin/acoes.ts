"use server";

import { revalidatePath } from "next/cache";
import { autenticar, sessaoAtual, trocarSenhaDoUsuario } from "@/lib/auth";
import {
  alternarFonte,
  apagarDemonstracao,
  apagarAnunciante,
  apagarBanner,
  apagarFonte,
  apagarPeca,
  atualizarPeriodo,
  criarAnunciante,
  criarBanner,
  criarDestaque,
  criarFonte,
  criarSlide,
  criarVideo,
  apagarMensagem,
  criarPagamento,
  marcarMensagemLida,
  marcarPagamentoPago,
  marcarSincronizacao,
  reordenar,
} from "@/lib/repositorio";
import {
  enderecoDoPlayer,
  obterConfig,
  salvarConfig,
} from "@/lib/configuracoes";
import { descobrirStatusUrl } from "@/lib/tocando";
import { testarEnvio } from "@/lib/email";
import { sincronizarTudo } from "@/lib/rss";
import { salvarImagem } from "@/lib/uploads";
import type { AdSlotId } from "@/lib/types";

export interface Resultado {
  ok: boolean;
  erro?: string;
}

/** Toda ação do painel confere a sessão antes de tocar no banco. */
async function exigirSessao() {
  const usuario = await sessaoAtual();
  if (!usuario) throw new Error("Sessão expirada. Entre de novo no painel.");
  return usuario;
}

function atualizarTelas(...caminhos: string[]) {
  revalidatePath("/");
  for (const caminho of caminhos) revalidatePath(caminho);
}

/* ------------------------------------------------------------------ */
/* Banners                                                             */
/* ------------------------------------------------------------------ */

export async function salvarBanner(form: FormData): Promise<Resultado> {
  await exigirSessao();

  const arquivo = form.get("arquivo");
  const anuncianteId = String(form.get("anunciante") ?? "");
  const slot = String(form.get("posicao") ?? "") as AdSlotId;
  const inicio = String(form.get("inicio") ?? "");
  const fim = String(form.get("fim") ?? "");
  const valor = Number(form.get("valor") ?? 0);
  const alt = String(form.get("alt") ?? "").trim();
  const href = String(form.get("href") ?? "").trim();

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, erro: "Envie a arte do banner." };
  }
  if (!anuncianteId) return { ok: false, erro: "Escolha o anunciante." };
  if (!slot) return { ok: false, erro: "Escolha a posição." };
  if (!inicio || !fim) return { ok: false, erro: "Preencha as duas datas." };
  if (fim < inicio) {
    return { ok: false, erro: "A data de fim não pode ser antes da de início." };
  }

  try {
    const imagem = await salvarImagem(arquivo);

    criarBanner({
      anuncianteId,
      slot,
      imagem,
      alt: alt || "Propaganda do anunciante",
      href,
      inicio,
      fim,
      valorCentavos: Math.round(valor * 100),
      // entra no ar já paga: a cobrança é controlada na tela de Pagamentos
      pago: true,
    });

    atualizarTelas("/admin/banners", "/admin");
    return { ok: true };
  } catch (erro) {
    return {
      ok: false,
      erro: erro instanceof Error ? erro.message : "Não consegui salvar.",
    };
  }
}

export async function removerBanner(id: string): Promise<Resultado> {
  await exigirSessao();
  apagarBanner(id);
  atualizarTelas("/admin/banners", "/admin");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Listas arrastáveis: slides, destaques e vídeos                      */
/* ------------------------------------------------------------------ */

type Tabela = "slides" | "destaques" | "videos";

export async function salvarOrdem(
  tabela: Tabela,
  ids: string[],
): Promise<Resultado> {
  await exigirSessao();
  reordenar(tabela, ids);
  atualizarTelas(`/admin/${tabela}`);
  return { ok: true };
}

export async function salvarPeriodo(
  tabela: "banners" | "slides" | "destaques",
  id: string,
  inicio: string,
  fim: string,
): Promise<Resultado> {
  await exigirSessao();

  if (!inicio || !fim) return { ok: false, erro: "Preencha as duas datas." };
  if (fim < inicio) {
    return { ok: false, erro: "A data de fim não pode ser antes da de início." };
  }

  atualizarPeriodo(tabela, id, inicio, fim);
  atualizarTelas(`/admin/${tabela}`, "/admin");
  return { ok: true };
}

export async function removerPeca(
  tabela: Tabela,
  id: string,
): Promise<Resultado> {
  await exigirSessao();
  apagarPeca(tabela, id);
  atualizarTelas(`/admin/${tabela}`);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Anunciantes                                                         */
/* ------------------------------------------------------------------ */

export async function salvarAnunciante(form: FormData): Promise<Resultado> {
  await exigirSessao();

  const nome = String(form.get("nome") ?? "").trim();
  const telefone = String(form.get("telefone") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();

  if (nome.length < 2) return { ok: false, erro: "Escreva o nome da loja." };
  if (!telefone && !email) {
    return { ok: false, erro: "Informe o telefone ou o e-mail." };
  }

  criarAnunciante({
    nome,
    contato: String(form.get("contato") ?? "").trim(),
    telefone,
    email,
    cidade: String(form.get("cidade") ?? "").trim(),
  });

  atualizarTelas("/admin/anunciantes");
  return { ok: true };
}

export async function removerAnunciante(id: string): Promise<Resultado> {
  await exigirSessao();
  apagarAnunciante(id);
  atualizarTelas("/admin/anunciantes");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Fontes de notícia                                                   */
/* ------------------------------------------------------------------ */

export async function salvarFonte(form: FormData): Promise<Resultado> {
  await exigirSessao();

  const nome = String(form.get("nome") ?? "").trim();
  const url = String(form.get("url") ?? "").trim();

  if (nome.length < 2) return { ok: false, erro: "Escreva o nome do site." };
  if (!/^https?:\/\/.+/.test(url)) {
    return { ok: false, erro: "O endereço precisa começar com http:// ou https://" };
  }

  criarFonte({
    nome,
    url,
    categoria: String(form.get("categoria") ?? "Cidade"),
  });

  atualizarTelas("/admin/noticias");
  return { ok: true };
}

export async function pausarOuAtivarFonte(id: string): Promise<Resultado> {
  await exigirSessao();
  alternarFonte(id);
  atualizarTelas("/admin/noticias");
  return { ok: true };
}

export async function removerFonte(id: string): Promise<Resultado> {
  await exigirSessao();
  apagarFonte(id);
  atualizarTelas("/admin/noticias");
  return { ok: true };
}

export async function sincronizarFonte(
  id: string,
  itens: number,
): Promise<Resultado> {
  await exigirSessao();
  marcarSincronizacao(id, itens);
  atualizarTelas("/admin/noticias");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Pagamentos                                                          */
/* ------------------------------------------------------------------ */

export async function gerarCobranca(form: FormData): Promise<Resultado> {
  await exigirSessao();

  const anuncianteId = String(form.get("anunciante") ?? "");
  const descricao = String(form.get("descricao") ?? "").trim();
  const valor = Number(form.get("valor") ?? 0);

  if (!anuncianteId) return { ok: false, erro: "Escolha o anunciante." };
  if (descricao.length < 3) {
    return { ok: false, erro: "Escreva o que está sendo cobrado." };
  }
  if (!valor || valor <= 0) {
    return { ok: false, erro: "Informe o valor da cobrança." };
  }

  criarPagamento({
    anuncianteId,
    descricao,
    valorCentavos: Math.round(valor * 100),
    // enquanto o Mercado Pago não está ligado, o código é de demonstração
    pixCode: process.env.PIX_CODE_DEMO ?? "",
  });

  atualizarTelas("/admin/pagamentos", "/admin");
  return { ok: true };
}

export async function confirmarPagamento(id: string): Promise<Resultado> {
  await exigirSessao();
  marcarPagamentoPago(id);
  atualizarTelas("/admin/pagamentos", "/admin");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Notícias: busca de verdade nos sites cadastrados                    */
/* ------------------------------------------------------------------ */

export interface ResultadoBusca extends Resultado {
  resumo?: string;
}

export async function atualizarNoticias(): Promise<ResultadoBusca> {
  await exigirSessao();

  const resultados = await sincronizarTudo();
  const total = resultados.reduce((soma, linha) => soma + linha.itens, 0);
  const falhas = resultados.filter((linha) => linha.erro);

  atualizarTelas("/admin/noticias");

  return {
    ok: falhas.length < resultados.length,
    resumo:
      `${total} notícias de ${resultados.length - falhas.length} sites` +
      (falhas.length > 0
        ? ` · não respondeu: ${falhas.map((linha) => linha.nome).join(", ")}`
        : ""),
  };
}

/* ------------------------------------------------------------------ */
/* Configurações da rádio                                              */
/* ------------------------------------------------------------------ */

export async function salvarConfiguracoes(form: FormData): Promise<Resultado> {
  await exigirSessao();

  const texto = (campo: string) => String(form.get(campo) ?? "").trim();

  salvarConfig({
    nomeDaRadio: texto("nomeDaRadio") || "Doce Melodia",
    siteUrl: texto("siteUrl").replace(/\/+$/, ""),
    streamUrl: texto("streamUrl"),
    playerEmbed: texto("playerEmbed"),
    bannerFormato: texto("bannerFormato") || "medio",
    emailDestino: texto("emailDestino"),
    smtpHost: texto("smtpHost"),
    smtpPorta: texto("smtpPorta"),
    smtpUsuario: texto("smtpUsuario"),
    smtpSenha: texto("smtpSenha"),
    whatsapp: texto("whatsapp"),
    whatsappMensagem: texto("whatsappMensagem"),
    email: texto("email"),
    instagram: texto("instagram"),
    facebook: texto("facebook"),
    youtube: texto("youtube"),
    seoTitulo: texto("seoTitulo"),
    seoDescricao: texto("seoDescricao"),
    seoPalavras: texto("seoPalavras"),
    googleVerificacao: texto("googleVerificacao"),
    googleAnalytics: texto("googleAnalytics"),
    bannerSegundos: texto("bannerSegundos") || "7",
  });

  // descobre sozinho o endereço que informa a música tocando
  const config = obterConfig();
  if (!config.statusUrl && config.playerEmbed) {
    const encontrado = await descobrirStatusUrl(
      enderecoDoPlayer(config.playerEmbed),
    );
    if (encontrado) salvarConfig({ statusUrl: encontrado });
  }

  atualizarTelas("/admin/configuracoes", "/contato");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Cadastro de slide, destaque e vídeo                                 */
/* ------------------------------------------------------------------ */

export async function salvarPeca(form: FormData): Promise<Resultado> {
  await exigirSessao();

  const tipo = String(form.get("tipo") ?? "");
  const arquivo = form.get("arquivo");
  const titulo = String(form.get("titulo") ?? "").trim();
  const subtitulo = String(form.get("subtitulo") ?? "").trim();
  const link = String(form.get("link") ?? "").trim();
  const anuncianteId = String(form.get("anunciante") ?? "");
  const inicio = String(form.get("inicio") ?? "");
  const fim = String(form.get("fim") ?? "");

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, erro: "Envie a imagem." };
  }
  if (titulo.length < 3) return { ok: false, erro: "Escreva o título." };

  const precisaPeriodo = tipo === "slides" || tipo === "destaques";
  if (precisaPeriodo && (!inicio || !fim)) {
    return { ok: false, erro: "Preencha a data de início e a de fim." };
  }
  if (precisaPeriodo && fim < inicio) {
    return { ok: false, erro: "A data de fim não pode ser antes da de início." };
  }

  try {
    const imagem = await salvarImagem(arquivo);

    if (tipo === "slides") {
      criarSlide({ titulo, subtitulo, imagem, href: link, inicio, fim });
    } else if (tipo === "destaques") {
      criarDestaque({
        titulo,
        resumo: subtitulo,
        imagem,
        href: link,
        anuncianteId,
        inicio,
        fim,
      });
    } else if (tipo === "videos") {
      criarVideo({ titulo, duracao: subtitulo, thumb: imagem, href: link });
    } else {
      return { ok: false, erro: "Tipo de peça desconhecido." };
    }

    atualizarTelas(`/admin/${tipo}`, "/admin");
    return { ok: true };
  } catch (erro) {
    return {
      ok: false,
      erro: erro instanceof Error ? erro.message : "Não consegui salvar.",
    };
  }
}

/** Remove o conteúdo de demonstração que veio junto na instalação. */
export async function limparDemonstracao(): Promise<Resultado> {
  await exigirSessao();
  apagarDemonstracao();
  atualizarTelas(
    "/admin",
    "/admin/banners",
    "/admin/slides",
    "/admin/destaques",
    "/admin/videos",
    "/admin/anunciantes",
    "/admin/pagamentos",
  );
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Mensagens do formulário                                             */
/* ------------------------------------------------------------------ */

export async function marcarRecadoLido(id: string): Promise<Resultado> {
  await exigirSessao();
  marcarMensagemLida(id);
  atualizarTelas("/admin/mensagens", "/admin");
  return { ok: true };
}

export async function apagarRecado(id: string): Promise<Resultado> {
  await exigirSessao();
  apagarMensagem(id);
  atualizarTelas("/admin/mensagens", "/admin");
  return { ok: true };
}

/** Confere se o e-mail configurado consegue conectar no servidor. */
export async function conferirEmail(): Promise<Resultado> {
  await exigirSessao();
  const problema = await testarEnvio();
  return problema ? { ok: false, erro: problema } : { ok: true };
}

/** Troca a senha de quem está usando o painel. */
export async function trocarSenha(form: FormData): Promise<Resultado> {
  const usuario = await exigirSessao();

  const atual = String(form.get("senhaAtual") ?? "");
  const nova = String(form.get("senhaNova") ?? "");
  const confirmacao = String(form.get("senhaConfirmacao") ?? "");

  if (!autenticar(usuario.email, atual)) {
    return { ok: false, erro: "A senha atual não confere." };
  }
  if (nova.length < 8) {
    return { ok: false, erro: "A senha nova precisa ter 8 caracteres ou mais." };
  }
  if (nova !== confirmacao) {
    return { ok: false, erro: "As duas senhas novas não são iguais." };
  }

  trocarSenhaDoUsuario(usuario.id, nova);
  return { ok: true };
}
