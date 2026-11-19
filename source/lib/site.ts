/** Configuração central do site. Um lugar só para trocar dados da rádio. */
export const site = {
  name: "Doce Melodia",
  shortName: "Doce Melodia",
  domain: "docemelodia.net",
  url: "https://docemelodia.net",
  slogan: "A trilha sonora do seu dia",
  description:
    "Rádio online Doce Melodia: música ao vivo 24 horas, notícias e os destaques do comércio da sua região.",
  locale: "pt-BR",
  city: "Brasil",
  email: "contato@docemelodia.net",
  /** Telefone no formato aceito pelo wa.me (somente dígitos, com DDI). */
  whatsapp: "5511999999999",
  whatsappMessage: "Olá! Vim pelo site da Doce Melodia.",
  /** Segundos que cada anunciante fica visível no banner rotativo. */
  bannerRotationSeconds: 7,
  /** URL do stream da BR Logic — substituir pelo endereço definitivo. */
  streamUrl: "https://stream.brlogic.com/docemelodia/stream",
  social: {
    instagram: "https://instagram.com/docemelodia",
    facebook: "https://facebook.com/docemelodia",
    youtube: "https://youtube.com/@docemelodia",
  },
} as const;

export const mainNav = [
  { label: "Início", href: "/" },
  { label: "Destaques", href: "/#destaques" },
  { label: "Notícias", href: "/#noticias" },
  { label: "Contato", href: "/contato" },
] as const;

/**
 * Referência de tempo dos fixtures. Mantém os rótulos ("há 2 horas")
 * estáveis entre servidor e cliente enquanto não há banco de dados.
 */
export const MOCK_NOW = new Date("2026-08-27T18:00:00-03:00");
