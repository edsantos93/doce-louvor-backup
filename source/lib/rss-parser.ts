/**
 * Leitura do XML dos feeds, sem tocar em banco nem em rede.
 * Fica separado para poder ser testado sozinho.
 */

export interface ItemBruto {
  titulo: string;
  resumo: string;
  link: string;
  imagem: string;
  publicadoEm: string;
}

/** Troca os códigos do XML (&amp;, &lt;…) pelos caracteres de verdade. */
export function decodificar(texto: string): string {
  return texto
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

export function limparTexto(texto: string): string {
  const semCdata = texto.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

  // decodifica primeiro: alguns sites mandam as tags escritas com &lt; e &gt;
  return decodificar(semCdata)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pegarTag(bloco: string, tag: string): string {
  const busca = new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i");
  return limparTexto(busca.exec(bloco)?.[1] ?? "");
}

const PADROES_DE_IMAGEM = [
  /<media:content[^>]+url="([^"]+)"/i,
  /<media:thumbnail[^>]+url="([^"]+)"/i,
  /<enclosure[^>]+url="([^"]+)"[^>]*type="image/i,
  /<enclosure[^>]+type="image[^"]*"[^>]*url="([^"]+)"/i,
  /<imagem-destaque[^>]*>([^<]+)</i,
  /<image[^>]*>[\s\S]*?<url>([^<]+)<\/url>/i,
];

/** A foto vem em um lugar diferente em cada site: tenta todos. */
export function acharImagem(bloco: string): string {
  for (const padrao of PADROES_DE_IMAGEM) {
    const achado = padrao.exec(bloco)?.[1]?.trim();
    if (achado && /^https?:\/\//i.test(achado)) return decodificar(achado);
  }

  // <img> dentro da descrição, escrito normal ou com os códigos do XML
  const aberto = decodificar(bloco);
  const naDescricao = /<img[^>]+src=["']?([^"'\s>]+)/i.exec(aberto)?.[1];
  if (naDescricao && /^https?:\/\//i.test(naDescricao)) {
    return decodificar(naDescricao);
  }

  // último recurso: qualquer endereço de imagem no meio do texto
  const solta = /https?:\/\/[^\s"'<>]+\.(?:jpe?g|png|webp)(?:\?[^\s"'<>]*)?/i.exec(
    aberto,
  )?.[0];
  return solta ? decodificar(solta) : "";
}

function paraISO(data: string): string {
  const quando = new Date(data);
  return Number.isNaN(quando.getTime())
    ? new Date().toISOString()
    : quando.toISOString();
}

/** Entende tanto RSS (<item>) quanto Atom (<entry>). */
export function lerFeed(xml: string): ItemBruto[] {
  const blocos = [
    ...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi),
    ...xml.matchAll(/<entry[\s>][\s\S]*?<\/entry>/gi),
  ].map((achado) => achado[0]);

  return blocos
    .map((bloco) => {
      const link =
        pegarTag(bloco, "link") ||
        /<link[^>]+href="([^"]+)"/i.exec(bloco)?.[1] ||
        pegarTag(bloco, "guid");

      return {
        titulo: pegarTag(bloco, "title"),
        resumo: (
          pegarTag(bloco, "atom:subtitle") ||
          pegarTag(bloco, "description") ||
          pegarTag(bloco, "summary")
        ).slice(0, 200),
        link: (link ?? "").trim(),
        imagem: acharImagem(bloco),
        publicadoEm: paraISO(
          pegarTag(bloco, "pubDate") ||
            pegarTag(bloco, "published") ||
            pegarTag(bloco, "updated"),
        ),
      };
    })
    .filter((item) => item.titulo && /^https?:\/\//i.test(item.link));
}
