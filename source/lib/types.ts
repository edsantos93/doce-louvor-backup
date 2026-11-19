/**
 * Tipos compartilhados entre o site público e o painel administrativo.
 * Enquanto não existe banco de dados, os fixtures em /lib/mock seguem
 * exatamente estes formatos — é o contrato que a API vai preencher depois.
 */

/** Faixa horizontal da página onde a peça é exibida. */
export type BandPosition = "topo" | "meio" | "rodape";

/** Situação de uma peça publicitária, derivada das datas e do pagamento. */
export type AdStatus =
  | "agendado"
  | "no-ar"
  | "expirado"
  | "aguardando-pagamento";

/** Identificador único de cada espaço publicitário da página. */
export type AdSlotId =
  | "topo-banner"
  | "meio-adsense"
  | "rodape-banner"
  | "destaque-1"
  | "destaque-2"
  | "feed-inline";

export type AdSlotKind = "banner" | "slide" | "adsense" | "destaque";

export interface AdCreative {
  id: string;
  /** Anunciante dono da peça (referencia Advertiser.id). */
  advertiserId: string;
  /** Nome exibido na etiqueta "Publicidade — Fulano". */
  advertiserName: string;
  imageUrl: string;
  /** Texto alternativo descritivo, obrigatório para acessibilidade. */
  alt: string;
  href: string;
  slot: AdSlotId;
  band: BandPosition | null;
  startDate: string;
  endDate: string;
  priceCents: number;
  status: AdStatus;
}

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  alt: string;
  href: string;
  /** Etiqueta curta acima do título ("Ao vivo", "Programação"). */
  kicker: string;
  startDate: string;
  endDate: string;
  status: AdStatus;
  order: number;
}

export interface Destaque {
  id: string;
  kind: "loja" | "post";
  title: string;
  excerpt: string;
  imageUrl: string;
  alt: string;
  href: string;
  /** Nome da loja, quando kind === "loja". */
  advertiserName?: string;
  startDate: string;
  endDate: string;
  status: AdStatus;
  order: number;
}

export interface NewsItem {
  id: string;
  title: string;
  /** Linha de apoio abaixo da manchete. */
  excerpt: string;
  /** Editoria da matéria: Cidade, Esportes, Cultura... */
  category: string;
  source: string;
  href: string;
  publishedAt: string;
  thumbUrl: string;
  alt: string;
  /** Matéria com vídeo ganha o selo de play sobre a foto. */
  media: "foto" | "video";
}

export interface VideoItem {
  id: string;
  title: string;
  thumbUrl: string;
  alt: string;
  href: string;
  /** Duração no formato 3:45, exibida sobre a miniatura. */
  duration: string;
  publishedAt: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  alt: string;
  href: string;
  author: string;
  publishedAt: string;
  /** Marca a matéria de abertura do feed. */
  featured?: boolean;
}

export interface Advertiser {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  since: string;
}

export interface NowPlaying {
  title: string;
  artist: string;
  /** Capa do disco; quando ausente o player usa o logotipo. */
  coverUrl: string | null;
  program: string;
  listeners: number;
  isLive: boolean;
}

export interface RssSource {
  id: string;
  name: string;
  url: string;
  category: string;
  lastSyncAt: string;
  active: boolean;
  itemCount: number;
}
