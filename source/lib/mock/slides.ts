import type { Slide } from "@/lib/types";

/** Slides do carrossel principal, na ordem em que aparecem. */
export const slides: Slide[] = [
  {
    id: "sld-01",
    kicker: "No ar agora",
    title: "Tarde Doce, com Ana Cláudia",
    subtitle:
      "Das 14h às 18h, os clássicos da música brasileira e os pedidos dos ouvintes pelo WhatsApp.",
    imageUrl: "/mock/hero-1.jpg",
    alt: "Estúdio da Doce Melodia com microfone e mesa de som iluminados em dourado",
    href: "/#programacao",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    status: "no-ar",
    order: 1,
  },
  {
    id: "sld-02",
    kicker: "Especial",
    title: "Sertanejo Raiz: uma hora de viola",
    subtitle:
      "Toda quarta-feira, às 20h, a viola caipira toma conta da programação da Doce Melodia.",
    imageUrl: "/mock/hero-2.jpg",
    alt: "Viola caipira apoiada em banco de madeira sob luz quente",
    href: "/#programacao",
    startDate: "2026-08-05",
    endDate: "2026-11-30",
    status: "no-ar",
    order: 2,
  },
  {
    id: "sld-03",
    kicker: "Participe",
    title: "Peça sua música pelo WhatsApp",
    subtitle:
      "Mande o nome da música e o recado para quem você ama. A gente coloca no ar na hora.",
    imageUrl: "/mock/hero-3.jpg",
    alt: "Celular exibindo conversa de pedido musical ao lado de fones de ouvido",
    href: "/contato",
    startDate: "2026-08-10",
    endDate: "2026-12-31",
    status: "no-ar",
    order: 3,
  },
  {
    id: "sld-04",
    kicker: "Anuncie",
    title: "Sua loja falando com o bairro inteiro",
    subtitle:
      "Banner, slide e citação no ar. Contrato por período, com entrada e saída automáticas.",
    imageUrl: "/mock/hero-4.jpg",
    alt: "Fachada de comércio de bairro com clientes na calçada ao entardecer",
    href: "/contato",
    startDate: "2026-08-12",
    endDate: "2026-12-31",
    status: "no-ar",
    order: 4,
  },
];
