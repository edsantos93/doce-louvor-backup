import "server-only";
import { db, novoId } from "@/lib/db";
import { marcarSincronizacao } from "@/lib/repositorio";
import { lerFeed } from "@/lib/rss-parser";
import type { NewsItem } from "@/lib/types";

/**
 * Busca as notícias dos sites cadastrados e guarda no banco, com foto e
 * link de verdade. A página lê do banco, então abre rápido mesmo quando
 * um dos sites de notícia está fora do ar.
 */

interface Fonte {
  id: string;
  nome: string;
  url: string;
  categoria: string;
}

/** Busca um site e grava as matérias. Devolve quantas entraram. */
export async function sincronizarUmaFonte(fonte: Fonte): Promise<number> {
  const resposta = await fetch(fonte.url, {
    headers: {
      "User-Agent": "DoceMelodia/1.0 (+https://docemelodia.net)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });

  if (!resposta.ok) throw new Error(`site respondeu ${resposta.status}`);

  const itens = lerFeed(await resposta.text()).slice(0, 15);
  const agora = new Date().toISOString();

  const apagar = db.prepare("DELETE FROM noticias_cache WHERE fonte_id = ?");
  const inserir = db.prepare(
    `INSERT INTO noticias_cache
       (id, fonte_id, fonte_nome, categoria, titulo, resumo, link, imagem, publicado_em, buscado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const gravar = db.transaction(() => {
    apagar.run(fonte.id);
    for (const item of itens) {
      inserir.run(
        novoId("not"),
        fonte.id,
        fonte.nome,
        fonte.categoria,
        item.titulo,
        item.resumo,
        item.link,
        item.imagem,
        item.publicadoEm,
        agora,
      );
    }
  });

  gravar();
  marcarSincronizacao(fonte.id, itens.length);
  return itens.length;
}

export interface ResultadoSync {
  nome: string;
  itens: number;
  erro?: string;
}

/** Atualiza todos os sites ativos. Um que falhe não derruba os outros. */
export async function sincronizarTudo(): Promise<ResultadoSync[]> {
  const fontes = db
    .prepare("SELECT id, nome, url, categoria FROM fontes_rss WHERE ativo = 1")
    .all() as Fonte[];

  const resultados: ResultadoSync[] = [];

  for (const fonte of fontes) {
    try {
      resultados.push({
        nome: fonte.nome,
        itens: await sincronizarUmaFonte(fonte),
      });
    } catch (erro) {
      resultados.push({
        nome: fonte.nome,
        itens: 0,
        erro: erro instanceof Error ? erro.message : "falhou",
      });
    }
  }

  return resultados;
}

interface LinhaNoticia {
  id: string;
  fonte_nome: string;
  categoria: string;
  titulo: string;
  resumo: string;
  link: string;
  imagem: string;
  publicado_em: string;
}

function paraNoticia(linha: LinhaNoticia): NewsItem {
  return {
    id: linha.id,
    title: linha.titulo,
    excerpt: linha.resumo,
    category: linha.categoria,
    source: linha.fonte_nome,
    href: linha.link,
    publishedAt: linha.publicado_em,
    thumbUrl: linha.imagem,
    alt: linha.titulo,
    media: "foto",
  };
}

/** Notícias guardadas, das mais novas para as mais velhas. */
export function noticiasGuardadas(limite = 12): NewsItem[] {
  const linhas = db
    .prepare("SELECT * FROM noticias_cache ORDER BY publicado_em DESC LIMIT ?")
    .all(limite) as LinhaNoticia[];

  return linhas.map(paraNoticia);
}

/** Só as que têm foto — usadas na coluna da direita. */
export function noticiasComFoto(limite = 6): NewsItem[] {
  const linhas = db
    .prepare(
      `SELECT * FROM noticias_cache WHERE imagem <> ''
       ORDER BY publicado_em DESC LIMIT ?`,
    )
    .all(limite) as LinhaNoticia[];

  return linhas.map(paraNoticia);
}

export function totalDeNoticias(): number {
  const linha = db
    .prepare("SELECT COUNT(*) AS total FROM noticias_cache")
    .get() as { total: number };
  return linha.total;
}

/** Quando foi a última busca, para mostrar no painel e decidir atualizar. */
export function ultimaBusca(): string | null {
  const linha = db
    .prepare("SELECT MAX(buscado_em) AS quando FROM noticias_cache")
    .get() as { quando: string | null };
  return linha.quando;
}
