import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TIPOS_DE_ARQUIVO, UPLOAD_DIR } from "@/lib/uploads";

/** Entrega as imagens enviadas pelo painel. */
export async function GET(
  _requisicao: Request,
  { params }: { params: Promise<{ caminho: string[] }> },
) {
  const { caminho } = await params;
  const nome = caminho.join("/");

  // nunca deixar sair da pasta de uploads
  if (nome.includes("..") || path.isAbsolute(nome)) {
    return new Response("Não encontrado", { status: 404 });
  }

  const arquivo = path.join(UPLOAD_DIR, nome);
  if (!existsSync(arquivo)) {
    return new Response("Não encontrado", { status: 404 });
  }

  const dados = await readFile(arquivo);
  const tipo =
    TIPOS_DE_ARQUIVO[path.extname(nome).toLowerCase()] ??
    "application/octet-stream";

  return new Response(new Uint8Array(dados), {
    headers: {
      "Content-Type": tipo,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
