import "server-only";
import { obterConfig } from "@/lib/configuracoes";

/**
 * O que está tocando agora.
 * A BR Logic informa o nome da faixa, mas não manda a foto do artista.
 * A capa vem do catálogo público da Apple Music, procurando pelo nome da
 * música — é de graça e não precisa de cadastro.
 */

export interface Tocando {
  titulo: string;
  artista: string;
  capa: string | null;
  aoVivo: boolean;
}

interface Cache {
  quando: number;
  dados: Tocando;
}

const capasConhecidas = new Map<string, string | null>();
let cache: Cache | null = null;
const VALIDADE = 20_000;

/**
 * Tira o lixo que vem do nome do arquivo: (Lyrics), (MP3_128K), "Clipe
 * Oficial", extensão, sublinhado. Sem isso a busca pela capa não acha nada.
 */
function limparNome(texto: string): string {
  return texto
    .replace(/\.(mp3|m4a|aac|wav|flac|ogg)\b/gi, " ")
    .replace(/\((?:[^()]*)\)|\[(?:[^\[\]]*)\]/g, (trecho) =>
      /ao vivo|live|acústic|remix|part\.?|feat/i.test(trecho) ? trecho : " ",
    )
    .replace(
      /\b(lyrics?|letra|official|oficial|video|v[ií]deo|clipe|audio|áudio|hd|hq|full|completo|mp3|\d{2,3}\s?k(?:bps)?)\b/gi,
      " ",
    )
    .replace(/[_]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s\-–—|]+|[\s\-–—|]+$/g, "")
    .trim();
}

/** "Casa Worship - Seu Amor Me Persegue" → artista e música. */
function separar(faixa: string): { artista: string; titulo: string } {
  const limpo = limparNome(faixa.replace(/\s+/g, " ").trim());
  const corte = limpo.split(/\s+[-–—]\s+/);

  if (corte.length >= 2) {
    return {
      artista: limparNome(corte[0]),
      titulo: limparNome(corte.slice(1).join(" - ")),
    };
  }
  return { artista: "", titulo: limpo };
}

/** Procura a capa do disco no catálogo da Apple. */
async function buscarCapa(busca: string): Promise<string | null> {
  if (capasConhecidas.has(busca)) return capasConhecidas.get(busca) ?? null;

  try {
    const endereco =
      "https://itunes.apple.com/search?media=music&limit=1&country=BR&term=" +
      encodeURIComponent(busca);

    const resposta = await fetch(endereco, {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!resposta.ok) throw new Error(String(resposta.status));

    const dados = (await resposta.json()) as {
      resultCount: number;
      results: { artworkUrl100?: string }[];
    };

    const arte = dados.results?.[0]?.artworkUrl100;
    // a Apple entrega 100x100 por padrão; dá para pedir maior trocando o nome
    const capa = arte ? arte.replace("100x100bb", "600x600bb") : null;

    capasConhecidas.set(busca, capa);
    if (capasConhecidas.size > 200) {
      capasConhecidas.delete(capasConhecidas.keys().next().value as string);
    }
    return capa;
  } catch {
    capasConhecidas.set(busca, null);
    return null;
  }
}

export async function tocandoAgora(): Promise<Tocando> {
  if (cache && Date.now() - cache.quando < VALIDADE) return cache.dados;

  const config = obterConfig();
  const vazio: Tocando = {
    titulo: "Doce Melodia",
    artista: "Ao vivo, 24 horas",
    capa: null,
    aoVivo: Boolean(config.streamUrl || config.playerEmbed),
  };

  if (!config.statusUrl) return vazio;

  try {
    const resposta = await fetch(config.statusUrl, {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!resposta.ok) throw new Error(String(resposta.status));

    const dados = (await resposta.json()) as {
      currentTrack?: string;
      streamingStatus?: number;
    };

    const faixa = (dados.currentTrack ?? "").trim();
    if (!faixa) return vazio;

    const { artista, titulo } = separar(faixa);

    // primeiro a música; não achando, a foto do artista já resolve
    const capa =
      (await buscarCapa([artista, titulo].filter(Boolean).join(" "))) ??
      (artista ? await buscarCapa(artista) : null);

    const resultado: Tocando = {
      titulo,
      artista: artista || "Doce Melodia",
      capa,
      aoVivo: dados.streamingStatus !== 0,
    };

    cache = { quando: Date.now(), dados: resultado };
    return resultado;
  } catch {
    return vazio;
  }
}

/**
 * Descobre sozinho o endereço que informa a música tocando, lendo a página
 * do player que a BR Logic entrega.
 */
export async function descobrirStatusUrl(
  paginaDoPlayer: string,
): Promise<string> {
  if (!/^https:\/\//i.test(paginaDoPlayer)) return "";

  try {
    const resposta = await fetch(paginaDoPlayer, {
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!resposta.ok) return "";

    const html = await resposta.text();
    const achado = /https?:\/\/[^"'\s]+\/api\/streaming\/status\/[^"'\s]+/i.exec(
      html,
    );
    return achado ? achado[0].replace(/\\\//g, "/") : "";
  } catch {
    return "";
  }
}
