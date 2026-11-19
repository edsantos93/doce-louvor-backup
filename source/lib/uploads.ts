import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Imagens enviadas pelo painel.
 * Ficam fora da pasta do programa para que publicar uma versão nova não
 * apague as artes dos anunciantes.
 */
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ??
  path.join(process.env.DADOS_DIR ?? path.join(process.cwd(), "dados-locais"), "uploads");

const EXTENSOES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

export const TIPOS_DE_ARQUIVO: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Grava a imagem e devolve o endereço público dela. */
export async function salvarImagem(arquivo: File): Promise<string> {
  const extensao = EXTENSOES[arquivo.type];
  if (!extensao) {
    throw new Error("Formato não aceito. Use JPG, PNG ou WebP.");
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    throw new Error("A imagem passa de 5 MB. Envie uma menor.");
  }

  const nome = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}${extensao}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    path.join(UPLOAD_DIR, nome),
    Buffer.from(await arquivo.arrayBuffer()),
  );

  return `/uploads/${nome}`;
}
