import { tocandoAgora } from "@/lib/tocando";

export const dynamic = "force-dynamic";

/** O player do site pergunta aqui, de tempos em tempos, o que está tocando. */
export async function GET() {
  const tocando = await tocandoAgora();

  return Response.json(tocando, {
    headers: { "Cache-Control": "public, max-age=15" },
  });
}
