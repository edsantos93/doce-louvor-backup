import "server-only";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { db, novoId } from "@/lib/db";

/**
 * Login do painel: senha guardada com scrypt e sessão em cookie assinado.
 * Sem biblioteca de terceiros — só o que o próprio Node já traz.
 */

const COOKIE = "dm_sessao";
const DURACAO_DIAS = 7;

const DADOS_DIR =
  process.env.DADOS_DIR ?? path.join(process.cwd(), "dados-locais");

/** Chave de assinatura da sessão: do ambiente ou de um arquivo no servidor. */
function chaveDeAssinatura(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;

  const arquivo = path.join(DADOS_DIR, "sessao.key");
  if (existsSync(arquivo)) return readFileSync(arquivo, "utf8").trim();

  if (!existsSync(DADOS_DIR)) mkdirSync(DADOS_DIR, { recursive: true });
  const chave = randomBytes(32).toString("hex");
  writeFileSync(arquivo, chave, { mode: 0o600 });
  return chave;
}

export function gerarHash(senha: string): string {
  const sal = randomBytes(16).toString("hex");
  const derivada = scryptSync(senha, sal, 64).toString("hex");
  return `${sal}:${derivada}`;
}

export function conferirSenha(senha: string, hash: string): boolean {
  const [sal, derivadaSalva] = hash.split(":");
  if (!sal || !derivadaSalva) return false;

  const derivada = scryptSync(senha, sal, 64);
  const salva = Buffer.from(derivadaSalva, "hex");
  if (derivada.length !== salva.length) return false;

  return timingSafeEqual(derivada, salva);
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export function contarUsuarios(): number {
  const linha = db.prepare("SELECT COUNT(*) AS total FROM usuarios").get() as {
    total: number;
  };
  return linha.total;
}

export function criarUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
}): Usuario {
  const id = novoId("usu");
  db.prepare(
    `INSERT INTO usuarios (id, nome, email, senha_hash, criado_em)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(
    id,
    dados.nome,
    dados.email.toLowerCase().trim(),
    gerarHash(dados.senha),
    new Date().toISOString(),
  );
  return { id, nome: dados.nome, email: dados.email };
}

export function autenticar(email: string, senha: string): Usuario | null {
  const linha = db
    .prepare("SELECT * FROM usuarios WHERE email = ?")
    .get(email.toLowerCase().trim()) as
    | { id: string; nome: string; email: string; senha_hash: string }
    | undefined;

  if (!linha) return null;
  if (!conferirSenha(senha, linha.senha_hash)) return null;

  return { id: linha.id, nome: linha.nome, email: linha.email };
}

function assinar(valor: string): string {
  return createHmac("sha256", chaveDeAssinatura()).update(valor).digest("hex");
}

/** Grava a sessão no cookie: id do usuário, validade e assinatura. */
export async function iniciarSessao(usuario: Usuario) {
  const expira = Date.now() + DURACAO_DIAS * 86_400_000;
  const corpo = `${usuario.id}.${expira}`;
  const jar = await cookies();

  jar.set(COOKIE, `${corpo}.${assinar(corpo)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_DIAS * 86_400,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Usuário da sessão atual, ou null se não houver sessão válida. */
export async function sessaoAtual(): Promise<Usuario | null> {
  const jar = await cookies();
  const bruto = jar.get(COOKIE)?.value;
  if (!bruto) return null;

  const [id, expira, assinatura] = bruto.split(".");
  if (!id || !expira || !assinatura) return null;

  const esperada = assinar(`${id}.${expira}`);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expira) < Date.now()) return null;

  const linha = db
    .prepare("SELECT id, nome, email FROM usuarios WHERE id = ?")
    .get(id) as Usuario | undefined;

  return linha ?? null;
}

/** Grava uma senha nova para o usuário. */
export function trocarSenhaDoUsuario(id: string, senha: string) {
  db.prepare("UPDATE usuarios SET senha_hash = ? WHERE id = ?").run(
    gerarHash(senha),
    id,
  );
}
