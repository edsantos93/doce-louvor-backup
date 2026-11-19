import type { AdSlotId, AdSlotKind, BandPosition } from "@/lib/types";

export interface AdSlotSpec {
  /** Nome em português exibido no espaço vazio e no painel. */
  label: string;
  kind: AdSlotKind;
  band: BandPosition | null;
  /** Nome curto, para caber na tabela do painel. */
  short: string;
  /** Medida recomendada da arte, mostrada ao cliente no espaço vazio. */
  recommended: string;
  /** Proporção usada para reservar a área e evitar deslocamento de layout. */
  ratio: string;
  /** Espaços de faixa esticam até a altura da faixa em vez de usar a proporção. */
  fillBand?: boolean;
}

export const BAND_LABEL: Record<BandPosition, string> = {
  topo: "Topo",
  meio: "Meio",
  rodape: "Rodapé",
};

/**
 * Três faixas horizontais, uma peça em cada, como o cliente desenhou:
 * banner rotativo no topo, AdSense no meio, banner rotativo no rodapé.
 * "Rotativo" quer dizer que várias artes se revezam no mesmo espaço.
 */
export const AD_SPECS: Record<AdSlotId, AdSlotSpec> = {
  "topo-banner": {
    label: "Banner rotativo — Topo",
    short: "Topo · Banner",
    kind: "banner",
    band: "topo",
    recommended: "728 × 120 px",
    ratio: "728 / 120",
    fillBand: true,
  },
  "meio-adsense": {
    label: "Google AdSense — Meio",
    short: "Meio · AdSense",
    kind: "adsense",
    band: "meio",
    recommended: "responsivo",
    ratio: "728 / 120",
    fillBand: true,
  },
  "rodape-banner": {
    label: "Banner rotativo — Rodapé",
    short: "Rodapé · Banner",
    kind: "banner",
    band: "rodape",
    recommended: "728 × 120 px",
    ratio: "728 / 120",
    fillBand: true,
  },
  "destaque-1": {
    label: "Destaque da loja — 1º espaço",
    short: "Destaque 1",
    kind: "destaque",
    band: null,
    recommended: "800 × 600 px",
    ratio: "4 / 3",
  },
  "destaque-2": {
    label: "Destaque da loja — 2º espaço",
    short: "Destaque 2",
    kind: "destaque",
    band: null,
    recommended: "800 × 600 px",
    ratio: "4 / 3",
  },
  "feed-inline": {
    label: "Banner no meio das matérias",
    short: "Entre as matérias",
    kind: "banner",
    band: null,
    recommended: "728 × 120 px",
    ratio: "728 / 120",
  },
};

/**
 * Formatos da faixa de anúncio. O cliente escolhe em Configurações:
 * mais fina ou mais alta, sempre ocupando a largura da página.
 */
export const FORMATOS_DE_BANNER = {
  fino: { proporcao: "1200 / 120", medida: "1200 × 120 px", nome: "Fino" },
  medio: { proporcao: "1200 / 200", medida: "1200 × 200 px", nome: "Médio" },
  grande: { proporcao: "1200 / 280", medida: "1200 × 280 px", nome: "Grande" },
} as const;

export type FormatoDeBanner = keyof typeof FORMATOS_DE_BANNER;

export function formatoDeBanner(escolha: string) {
  return (
    FORMATOS_DE_BANNER[escolha as FormatoDeBanner] ?? FORMATOS_DE_BANNER.medio
  );
}

/** A peça de cada faixa horizontal. */
export const BAND_SLOT: Record<BandPosition, AdSlotId> = {
  topo: "topo-banner",
  meio: "meio-adsense",
  rodape: "rodape-banner",
};
