import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { semear, trocarFontesDeExemplo } from "@/lib/seed";

/**
 * Banco de dados do site: um arquivo SQLite só.
 * Fica fora da pasta do programa (DADOS_DIR) para que publicar uma versão
 * nova nunca apague o conteúdo, e para o backup ser copiar um arquivo.
 */

const DADOS_DIR =
  process.env.DADOS_DIR ?? path.join(process.cwd(), "dados-locais");

function abrir(): Database.Database {
  if (!existsSync(DADOS_DIR)) mkdirSync(DADOS_DIR, { recursive: true });

  const banco = new Database(path.join(DADOS_DIR, "docemelodia.db"));
  banco.pragma("journal_mode = WAL");
  banco.pragma("foreign_keys = ON");
  criarTabelas(banco);
  semear(banco);
  trocarFontesDeExemplo(banco);
  return banco;
}

function criarTabelas(banco: Database.Database) {
  banco.exec(`
    CREATE TABLE IF NOT EXISTS configuracoes (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS noticias_cache (
      id TEXT PRIMARY KEY,
      fonte_id TEXT NOT NULL,
      fonte_nome TEXT NOT NULL,
      categoria TEXT NOT NULL DEFAULT '',
      titulo TEXT NOT NULL,
      resumo TEXT NOT NULL DEFAULT '',
      link TEXT NOT NULL,
      imagem TEXT NOT NULL DEFAULT '',
      publicado_em TEXT NOT NULL,
      buscado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mensagens (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      assunto TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      lida INTEGER NOT NULL DEFAULT 0,
      enviada INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      criado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS anunciantes (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      contato TEXT NOT NULL DEFAULT '',
      telefone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      cidade TEXT NOT NULL DEFAULT '',
      desde TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      anunciante_id TEXT REFERENCES anunciantes(id) ON DELETE SET NULL,
      slot TEXT NOT NULL,
      imagem TEXT NOT NULL,
      alt TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT '',
      inicio TEXT NOT NULL,
      fim TEXT NOT NULL,
      valor_centavos INTEGER NOT NULL DEFAULT 0,
      pago INTEGER NOT NULL DEFAULT 0,
      ordem INTEGER NOT NULL DEFAULT 0,
      criado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS slides (
      id TEXT PRIMARY KEY,
      kicker TEXT NOT NULL DEFAULT '',
      titulo TEXT NOT NULL,
      subtitulo TEXT NOT NULL DEFAULT '',
      imagem TEXT NOT NULL,
      alt TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT '',
      inicio TEXT NOT NULL,
      fim TEXT NOT NULL,
      ordem INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS destaques (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL DEFAULT 'loja',
      anunciante_id TEXT REFERENCES anunciantes(id) ON DELETE SET NULL,
      titulo TEXT NOT NULL,
      resumo TEXT NOT NULL DEFAULT '',
      imagem TEXT NOT NULL,
      alt TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT '',
      inicio TEXT NOT NULL,
      fim TEXT NOT NULL,
      ordem INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      thumb TEXT NOT NULL,
      alt TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT '',
      duracao TEXT NOT NULL DEFAULT '',
      publicado_em TEXT NOT NULL,
      ordem INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS fontes_rss (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      url TEXT NOT NULL,
      categoria TEXT NOT NULL DEFAULT 'Cidade',
      ativo INTEGER NOT NULL DEFAULT 1,
      ultima_sync TEXT,
      itens INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pagamentos (
      id TEXT PRIMARY KEY,
      anunciante_id TEXT REFERENCES anunciantes(id) ON DELETE SET NULL,
      descricao TEXT NOT NULL,
      valor_centavos INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'aguardando',
      criado_em TEXT NOT NULL,
      pago_em TEXT,
      pix_code TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_noticias_data ON noticias_cache(publicado_em DESC);
    CREATE INDEX IF NOT EXISTS idx_banners_periodo ON banners(slot, inicio, fim);
    CREATE INDEX IF NOT EXISTS idx_slides_periodo ON slides(inicio, fim);
    CREATE INDEX IF NOT EXISTS idx_destaques_periodo ON destaques(inicio, fim);
  `);
}

/**
 * Uma conexão só para todo o processo. O `globalThis` evita abrir um banco
 * novo a cada recarregamento durante o desenvolvimento.
 */
const cache = globalThis as unknown as { bancoDoceMelodia?: Database.Database };

export const db: Database.Database = cache.bancoDoceMelodia ?? abrir();

if (process.env.NODE_ENV !== "production") {
  cache.bancoDoceMelodia = db;
}

/** Identificador curto e legível, no formato ban-a1b2c3. */
export function novoId(prefixo: string): string {
  return `${prefixo}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Data de hoje em aaaa-mm-dd, no fuso de São Paulo. */
export function hojeISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}
