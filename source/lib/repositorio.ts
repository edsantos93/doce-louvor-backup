import "server-only";
import { AD_SPECS } from "@/lib/ads";
import { db, hojeISO, novoId } from "@/lib/db";
import type { PaymentStatus } from "@/lib/status";
import type {
  AdCreative,
  AdSlotId,
  AdStatus,
  Advertiser,
  Destaque,
  RssSource,
  Slide,
  VideoItem,
} from "@/lib/types";

/**
 * Todas as consultas do site em um lugar só.
 * O site público chama as funções "…NoAr", que filtram pela data de hoje —
 * é isso que faz a propaganda entrar e sair sozinha, sem nenhuma rotina
 * agendada para rodar de madrugada.
 */

/** A situação da peça sai da conta entre as datas e o pagamento. */
export function situacao(
  inicio: string,
  fim: string,
  pago: boolean,
  hoje = hojeISO(),
): AdStatus {
  if (!pago) return "aguardando-pagamento";
  if (hoje < inicio) return "agendado";
  if (hoje > fim) return "expirado";
  return "no-ar";
}

interface LinhaBanner {
  id: string;
  anunciante_id: string | null;
  anunciante_nome: string | null;
  slot: string;
  imagem: string;
  alt: string;
  href: string;
  inicio: string;
  fim: string;
  valor_centavos: number;
  pago: number;
}

function paraCriativo(linha: LinhaBanner): AdCreative {
  const slot = linha.slot as AdSlotId;

  return {
    id: linha.id,
    advertiserId: linha.anunciante_id ?? "",
    advertiserName: linha.anunciante_nome ?? "Sem anunciante",
    imageUrl: linha.imagem,
    alt: linha.alt,
    href: linha.href,
    slot,
    band: AD_SPECS[slot]?.band ?? null,
    startDate: linha.inicio,
    endDate: linha.fim,
    priceCents: linha.valor_centavos,
    status: situacao(linha.inicio, linha.fim, linha.pago === 1),
  };
}

const SELECT_BANNER = `
  SELECT b.id, b.anunciante_id, a.nome AS anunciante_nome, b.slot, b.imagem,
         b.alt, b.href, b.inicio, b.fim, b.valor_centavos, b.pago
  FROM banners b
  LEFT JOIN anunciantes a ON a.id = b.anunciante_id
`;

/* ------------------------------------------------------------------ */
/* Banners                                                             */
/* ------------------------------------------------------------------ */

export function listarBanners(): AdCreative[] {
  const linhas = db
    .prepare(`${SELECT_BANNER} ORDER BY b.inicio DESC`)
    .all() as LinhaBanner[];
  return linhas.map(paraCriativo);
}

/** Peças de um espaço que estão no ar hoje — mais de uma vira rodízio. */
export function bannersNoAr(slot: AdSlotId): AdCreative[] {
  const hoje = hojeISO();
  const linhas = db
    .prepare(
      `${SELECT_BANNER}
       WHERE b.slot = ? AND b.pago = 1 AND b.inicio <= ? AND b.fim >= ?
       ORDER BY b.ordem, b.inicio`,
    )
    .all(slot, hoje, hoje) as LinhaBanner[];
  return linhas.map(paraCriativo);
}

export interface NovoBanner {
  anuncianteId: string;
  slot: AdSlotId;
  imagem: string;
  alt: string;
  href: string;
  inicio: string;
  fim: string;
  valorCentavos: number;
  pago: boolean;
}

export function criarBanner(dados: NovoBanner): string {
  const id = novoId("ban");
  db.prepare(
    `INSERT INTO banners (id, anunciante_id, slot, imagem, alt, href, inicio, fim, valor_centavos, pago, ordem, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
  ).run(
    id,
    dados.anuncianteId,
    dados.slot,
    dados.imagem,
    dados.alt,
    dados.href,
    dados.inicio,
    dados.fim,
    dados.valorCentavos,
    dados.pago ? 1 : 0,
    new Date().toISOString(),
  );
  return id;
}

export function apagarBanner(id: string) {
  db.prepare("DELETE FROM banners WHERE id = ?").run(id);
}

/* ------------------------------------------------------------------ */
/* Slides, destaques e vídeos                                          */
/* ------------------------------------------------------------------ */

interface LinhaSlide {
  id: string;
  kicker: string;
  titulo: string;
  subtitulo: string;
  imagem: string;
  alt: string;
  href: string;
  inicio: string;
  fim: string;
  ordem: number;
}

function paraSlide(linha: LinhaSlide): Slide {
  return {
    id: linha.id,
    kicker: linha.kicker,
    title: linha.titulo,
    subtitle: linha.subtitulo,
    imageUrl: linha.imagem,
    alt: linha.alt,
    href: linha.href,
    startDate: linha.inicio,
    endDate: linha.fim,
    status: situacao(linha.inicio, linha.fim, true),
    order: linha.ordem,
  };
}

export function listarSlides(): Slide[] {
  const linhas = db
    .prepare("SELECT * FROM slides ORDER BY ordem, titulo")
    .all() as LinhaSlide[];
  return linhas.map(paraSlide);
}

export function slidesNoAr(): Slide[] {
  const hoje = hojeISO();
  const linhas = db
    .prepare(
      "SELECT * FROM slides WHERE inicio <= ? AND fim >= ? ORDER BY ordem, titulo",
    )
    .all(hoje, hoje) as LinhaSlide[];
  return linhas.map(paraSlide);
}

interface LinhaDestaque {
  id: string;
  tipo: string;
  anunciante_nome: string | null;
  titulo: string;
  resumo: string;
  imagem: string;
  alt: string;
  href: string;
  inicio: string;
  fim: string;
  ordem: number;
}

function paraDestaque(linha: LinhaDestaque): Destaque {
  return {
    id: linha.id,
    kind: linha.tipo === "post" ? "post" : "loja",
    title: linha.titulo,
    excerpt: linha.resumo,
    imageUrl: linha.imagem,
    alt: linha.alt,
    href: linha.href,
    advertiserName: linha.anunciante_nome ?? undefined,
    startDate: linha.inicio,
    endDate: linha.fim,
    status: situacao(linha.inicio, linha.fim, true),
    order: linha.ordem,
  };
}

const SELECT_DESTAQUE = `
  SELECT d.id, d.tipo, a.nome AS anunciante_nome, d.titulo, d.resumo, d.imagem,
         d.alt, d.href, d.inicio, d.fim, d.ordem
  FROM destaques d
  LEFT JOIN anunciantes a ON a.id = d.anunciante_id
`;

export function listarDestaques(): Destaque[] {
  const linhas = db
    .prepare(`${SELECT_DESTAQUE} ORDER BY d.ordem, d.titulo`)
    .all() as LinhaDestaque[];
  return linhas.map(paraDestaque);
}

export function destaquesNoAr(): Destaque[] {
  const hoje = hojeISO();
  const linhas = db
    .prepare(
      `${SELECT_DESTAQUE} WHERE d.inicio <= ? AND d.fim >= ? ORDER BY d.ordem, d.titulo`,
    )
    .all(hoje, hoje) as LinhaDestaque[];
  return linhas.map(paraDestaque);
}

interface LinhaVideo {
  id: string;
  titulo: string;
  thumb: string;
  alt: string;
  href: string;
  duracao: string;
  publicado_em: string;
  ordem: number;
}

export function listarVideos(): VideoItem[] {
  const linhas = db
    .prepare("SELECT * FROM videos ORDER BY ordem, publicado_em DESC")
    .all() as LinhaVideo[];

  return linhas.map((linha) => ({
    id: linha.id,
    title: linha.titulo,
    thumbUrl: linha.thumb,
    alt: linha.alt,
    href: linha.href,
    duration: linha.duracao,
    publishedAt: linha.publicado_em,
  }));
}

/** Grava a nova ordem de uma lista arrastável. */
export function reordenar(
  tabela: "slides" | "destaques" | "videos",
  ids: string[],
) {
  const atualizar = db.prepare(`UPDATE ${tabela} SET ordem = ? WHERE id = ?`);
  const tudo = db.transaction(() => {
    ids.forEach((id, posicao) => atualizar.run(posicao, id));
  });
  tudo();
}

/** Muda o período de veiculação de uma peça. */
export function atualizarPeriodo(
  tabela: "banners" | "slides" | "destaques",
  id: string,
  inicio: string,
  fim: string,
) {
  db.prepare(`UPDATE ${tabela} SET inicio = ?, fim = ? WHERE id = ?`).run(
    inicio,
    fim,
    id,
  );
}

export function apagarPeca(
  tabela: "slides" | "destaques" | "videos",
  id: string,
) {
  db.prepare(`DELETE FROM ${tabela} WHERE id = ?`).run(id);
}

/* ------------------------------------------------------------------ */
/* Anunciantes                                                         */
/* ------------------------------------------------------------------ */

interface LinhaAnunciante {
  id: string;
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  cidade: string;
  desde: string;
}

export function listarAnunciantes(): Advertiser[] {
  const linhas = db
    .prepare("SELECT * FROM anunciantes ORDER BY nome")
    .all() as LinhaAnunciante[];

  return linhas.map((linha) => ({
    id: linha.id,
    name: linha.nome,
    contactName: linha.contato,
    phone: linha.telefone,
    email: linha.email,
    city: linha.cidade,
    since: linha.desde,
  }));
}

export function criarAnunciante(dados: {
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  cidade: string;
}): string {
  const id = novoId("anu");
  db.prepare(
    `INSERT INTO anunciantes (id, nome, contato, telefone, email, cidade, desde)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    dados.nome,
    dados.contato,
    dados.telefone,
    dados.email,
    dados.cidade,
    hojeISO(),
  );
  return id;
}

export function apagarAnunciante(id: string) {
  db.prepare("DELETE FROM anunciantes WHERE id = ?").run(id);
}

/* ------------------------------------------------------------------ */
/* Fontes de notícia                                                   */
/* ------------------------------------------------------------------ */

interface LinhaFonte {
  id: string;
  nome: string;
  url: string;
  categoria: string;
  ativo: number;
  ultima_sync: string | null;
  itens: number;
}

export function listarFontes(): RssSource[] {
  const linhas = db
    .prepare("SELECT * FROM fontes_rss ORDER BY nome")
    .all() as LinhaFonte[];

  return linhas.map((linha) => ({
    id: linha.id,
    name: linha.nome,
    url: linha.url,
    category: linha.categoria,
    active: linha.ativo === 1,
    lastSyncAt: linha.ultima_sync ?? new Date(0).toISOString(),
    itemCount: linha.itens,
  }));
}

export function criarFonte(dados: {
  nome: string;
  url: string;
  categoria: string;
}): string {
  const id = novoId("rss");
  db.prepare(
    `INSERT INTO fontes_rss (id, nome, url, categoria, ativo, ultima_sync, itens)
     VALUES (?, ?, ?, ?, 1, NULL, 0)`,
  ).run(id, dados.nome, dados.url, dados.categoria);
  return id;
}

export function alternarFonte(id: string) {
  db.prepare(
    "UPDATE fontes_rss SET ativo = CASE ativo WHEN 1 THEN 0 ELSE 1 END WHERE id = ?",
  ).run(id);
}

export function apagarFonte(id: string) {
  db.prepare("DELETE FROM fontes_rss WHERE id = ?").run(id);
}

export function marcarSincronizacao(id: string, itens: number) {
  db.prepare(
    "UPDATE fontes_rss SET ultima_sync = ?, itens = ? WHERE id = ?",
  ).run(new Date().toISOString(), itens, id);
}

/* ------------------------------------------------------------------ */
/* Pagamentos                                                          */
/* ------------------------------------------------------------------ */

export interface PagamentoLinha {
  id: string;
  advertiserId: string;
  advertiserName: string;
  description: string;
  valueCents: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
  pixCode: string;
}

export function listarPagamentos(): PagamentoLinha[] {
  const linhas = db
    .prepare(
      `SELECT p.id, p.anunciante_id, a.nome AS anunciante_nome, p.descricao,
              p.valor_centavos, p.status, p.criado_em, p.pago_em, p.pix_code
       FROM pagamentos p
       LEFT JOIN anunciantes a ON a.id = p.anunciante_id
       ORDER BY p.criado_em DESC`,
    )
    .all() as {
    id: string;
    anunciante_id: string | null;
    anunciante_nome: string | null;
    descricao: string;
    valor_centavos: number;
    status: string;
    criado_em: string;
    pago_em: string | null;
    pix_code: string;
  }[];

  return linhas.map((linha) => ({
    id: linha.id,
    advertiserId: linha.anunciante_id ?? "",
    advertiserName: linha.anunciante_nome ?? "Sem anunciante",
    description: linha.descricao,
    valueCents: linha.valor_centavos,
    status: linha.status as PaymentStatus,
    createdAt: linha.criado_em,
    paidAt: linha.pago_em,
    pixCode: linha.pix_code,
  }));
}

export function criarPagamento(dados: {
  anuncianteId: string;
  descricao: string;
  valorCentavos: number;
  pixCode: string;
}): string {
  const id = novoId("pag");
  db.prepare(
    `INSERT INTO pagamentos (id, anunciante_id, descricao, valor_centavos, status, criado_em, pago_em, pix_code)
     VALUES (?, ?, ?, ?, 'aguardando', ?, NULL, ?)`,
  ).run(
    id,
    dados.anuncianteId,
    dados.descricao,
    dados.valorCentavos,
    new Date().toISOString(),
    dados.pixCode,
  );
  return id;
}

export function marcarPagamentoPago(id: string) {
  db.prepare(
    "UPDATE pagamentos SET status = 'pago', pago_em = ? WHERE id = ?",
  ).run(new Date().toISOString(), id);
}

/* ------------------------------------------------------------------ */
/* Cadastro de slides, destaques e vídeos                              */
/* ------------------------------------------------------------------ */

export function criarSlide(dados: {
  titulo: string;
  subtitulo: string;
  imagem: string;
  href: string;
  inicio: string;
  fim: string;
}): string {
  const id = novoId("sld");
  db.prepare(
    `INSERT INTO slides (id, kicker, titulo, subtitulo, imagem, alt, href, inicio, fim, ordem)
     VALUES (?, 'Destaque', ?, ?, ?, ?, ?, ?, ?, 999)`,
  ).run(
    id,
    dados.titulo,
    dados.subtitulo,
    dados.imagem,
    dados.titulo,
    dados.href,
    dados.inicio,
    dados.fim,
  );
  return id;
}

export function criarDestaque(dados: {
  titulo: string;
  resumo: string;
  imagem: string;
  href: string;
  anuncianteId: string;
  inicio: string;
  fim: string;
}): string {
  const id = novoId("des");
  db.prepare(
    `INSERT INTO destaques (id, tipo, anunciante_id, titulo, resumo, imagem, alt, href, inicio, fim, ordem)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 999)`,
  ).run(
    id,
    dados.anuncianteId ? "loja" : "post",
    dados.anuncianteId || null,
    dados.titulo,
    dados.resumo,
    dados.imagem,
    dados.titulo,
    dados.href,
    dados.inicio,
    dados.fim,
  );
  return id;
}

export function criarVideo(dados: {
  titulo: string;
  duracao: string;
  thumb: string;
  href: string;
}): string {
  const id = novoId("vid");
  db.prepare(
    `INSERT INTO videos (id, titulo, thumb, alt, href, duracao, publicado_em, ordem)
     VALUES (?, ?, ?, ?, ?, ?, ?, 999)`,
  ).run(
    id,
    dados.titulo,
    dados.thumb,
    dados.titulo,
    dados.href,
    dados.duracao,
    new Date().toISOString(),
  );
  return id;
}

/* ------------------------------------------------------------------ */
/* Limpeza do conteúdo de demonstração                                 */
/* ------------------------------------------------------------------ */

/** Quanta coisa de exemplo ainda existe no site. */
export function contarDemonstracao(): number {
  const linha = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM banners WHERE imagem LIKE '/mock/%') +
         (SELECT COUNT(*) FROM slides WHERE imagem LIKE '/mock/%') +
         (SELECT COUNT(*) FROM destaques WHERE imagem LIKE '/mock/%') +
         (SELECT COUNT(*) FROM videos WHERE thumb LIKE '/mock/%') +
         (SELECT COUNT(*) FROM pagamentos WHERE id LIKE 'pag-0%') AS total`,
    )
    .get() as { total: number };
  return linha.total;
}

/**
 * Apaga tudo o que veio de exemplo: as peças com imagem da pasta /mock e os
 * anunciantes fictícios. O que o cliente cadastrou fica.
 */
export function apagarDemonstracao() {
  const tudo = db.transaction(() => {
    db.prepare("DELETE FROM banners WHERE imagem LIKE '/mock/%'").run();
    db.prepare("DELETE FROM slides WHERE imagem LIKE '/mock/%'").run();
    db.prepare("DELETE FROM destaques WHERE imagem LIKE '/mock/%'").run();
    db.prepare("DELETE FROM videos WHERE thumb LIKE '/mock/%'").run();
    db.prepare("DELETE FROM pagamentos WHERE id LIKE 'pag-0%'").run();
    db.prepare(
      `DELETE FROM anunciantes
       WHERE id LIKE 'anu-0%'
         AND id NOT IN (SELECT anunciante_id FROM banners WHERE anunciante_id IS NOT NULL)`,
    ).run();
  });
  tudo();
}

/* ------------------------------------------------------------------ */
/* Mensagens do formulário de contato                                  */
/* ------------------------------------------------------------------ */

export interface Mensagem {
  id: string;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  criadoEm: string;
  lida: boolean;
  enviada: boolean;
}

export function listarMensagens(): Mensagem[] {
  const linhas = db
    .prepare("SELECT * FROM mensagens ORDER BY criado_em DESC LIMIT 200")
    .all() as {
    id: string;
    nome: string;
    email: string;
    assunto: string;
    mensagem: string;
    criado_em: string;
    lida: number;
    enviada: number;
  }[];

  return linhas.map((linha) => ({
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    assunto: linha.assunto,
    mensagem: linha.mensagem,
    criadoEm: linha.criado_em,
    lida: linha.lida === 1,
    enviada: linha.enviada === 1,
  }));
}

export function contarMensagensNovas(): number {
  const linha = db
    .prepare("SELECT COUNT(*) AS total FROM mensagens WHERE lida = 0")
    .get() as { total: number };
  return linha.total;
}

export function marcarMensagemLida(id: string) {
  db.prepare("UPDATE mensagens SET lida = 1 WHERE id = ?").run(id);
}

export function apagarMensagem(id: string) {
  db.prepare("DELETE FROM mensagens WHERE id = ?").run(id);
}
