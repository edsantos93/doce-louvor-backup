import { revalidatePath } from "next/cache";
import { sessaoAtual } from "@/lib/auth";
import { sincronizarTudo, totalDeNoticias } from "@/lib/rss";

export const dynamic = "force-dynamic";

/**
 * Busca as notícias dos sites cadastrados.
 * É chamada de meia em meia hora pelo próprio servidor (com a chave) e
 * também pelo botão "Atualizar agora" do painel (com a sessão aberta).
 */
export async function GET(requisicao: Request) {
  const url = new URL(requisicao.url);
  const chave = process.env.CRON_KEY;
  const autorizadoPelaChave = Boolean(chave) && url.searchParams.get("chave") === chave;

  if (!autorizadoPelaChave && !(await sessaoAtual())) {
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  }

  const resultados = await sincronizarTudo();
  revalidatePath("/");

  return Response.json({
    ok: true,
    guardadas: totalDeNoticias(),
    fontes: resultados,
  });
}
