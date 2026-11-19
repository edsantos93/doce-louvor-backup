import type { NowPlaying, Post } from "@/lib/types";

/** Feed principal da coluna central. */
export const posts: Post[] = [
  {
    id: "pst-01",
    title: "Doce Melodia completa uma semana no ar e já tem pedido de ouvinte",
    excerpt:
      "A rádio entrou no ar no dia 20 e a caixa de mensagens não parou mais. Contamos como foi a primeira semana de programação, do teste de transmissão ao primeiro recado lido no ar.",
    category: "Da rádio",
    imageUrl: "/mock/post-1.jpg",
    alt: "Locutora falando ao microfone no estúdio da Doce Melodia",
    href: "/#feed",
    author: "Redação Doce Melodia",
    publishedAt: "2026-08-27T16:00:00-03:00",
    featured: true,
  },
  {
    id: "pst-02",
    title: "Playlist da manhã ganha bloco de música gospel às 7h",
    excerpt:
      "A partir de segunda-feira, meia hora de louvor abre a programação antes do primeiro boletim de notícias.",
    category: "Programação",
    imageUrl: "/mock/post-2.jpg",
    alt: "Amanhecer visto da janela do estúdio com equipamento de rádio em primeiro plano",
    href: "/#feed",
    author: "Redação Doce Melodia",
    publishedAt: "2026-08-27T13:20:00-03:00",
  },
  {
    id: "pst-03",
    title: "Como pedir sua música e mandar recado para quem você ama",
    excerpt:
      "Passo a passo pelo WhatsApp da rádio, com os horários em que os pedidos entram mais rápido no ar.",
    category: "Ouvinte",
    imageUrl: "/mock/post-3.jpg",
    alt: "Mão segurando celular com o WhatsApp da rádio aberto",
    href: "/contato",
    author: "Ana Cláudia",
    publishedAt: "2026-08-27T09:45:00-03:00",
  },
  {
    id: "pst-04",
    title: "Comércio da região começa a anunciar na rádio com contrato mensal",
    excerpt:
      "Cinco lojas já estão no ar. O anúncio entra e sai sozinho na data combinada, sem precisar avisar ninguém.",
    category: "Anuncie",
    imageUrl: "/mock/post-4.jpg",
    alt: "Comerciante atendendo cliente atrás do balcão da loja",
    href: "/contato",
    author: "Redação Doce Melodia",
    publishedAt: "2026-08-26T18:30:00-03:00",
  },
  {
    id: "pst-05",
    title: "Sertanejo raiz volta às quartas com uma hora de viola caipira",
    excerpt:
      "O bloco recupera gravações clássicas e abre espaço para violeiros da região mandarem seus vídeos.",
    category: "Programação",
    imageUrl: "/mock/post-5.jpg",
    alt: "Violeiro tocando viola caipira em varanda de madeira",
    href: "/#feed",
    author: "Jorge Menezes",
    publishedAt: "2026-08-26T11:10:00-03:00",
  },
  {
    id: "pst-06",
    title: "Ouvintes escolhem o nome do novo programa das noites de sábado",
    excerpt:
      "Três opções foram para a votação no WhatsApp e a diferença entre a primeira e a segunda foi de sete votos.",
    category: "Ouvinte",
    imageUrl: "/mock/post-6.jpg",
    alt: "Grupo de pessoas dançando em festa noturna ao som da rádio",
    href: "/#feed",
    author: "Redação Doce Melodia",
    publishedAt: "2026-08-25T20:05:00-03:00",
  },
  {
    id: "pst-07",
    title: "Doce Melodia agora toca também no carro e na caixinha de som",
    excerpt:
      "O sinal abre em qualquer aparelho com internet. Explicamos como deixar a rádio salva nos favoritos.",
    category: "Da rádio",
    imageUrl: "/mock/post-7.jpg",
    alt: "Painel de carro com aplicativo de rádio aberto na tela",
    href: "/#feed",
    author: "Redação Doce Melodia",
    publishedAt: "2026-08-25T08:15:00-03:00",
  },
];

/** Faixas usadas pelo hook useNowPlaying enquanto não há metadados reais. */
export const nowPlayingQueue: NowPlaying[] = [
  {
    title: "Coração Sertanejo",
    artist: "Duo Estrada Velha",
    coverUrl: "/mock/capa-1.jpg",
    program: "Tarde Doce",
    listeners: 214,
    isLive: true,
  },
  {
    title: "Amanhecer na Varanda",
    artist: "Marisa Fontes",
    coverUrl: "/mock/capa-2.jpg",
    program: "Tarde Doce",
    listeners: 221,
    isLive: true,
  },
  {
    title: "Saudade de Casa",
    artist: "Trio Bem-te-vi",
    coverUrl: null,
    program: "Tarde Doce",
    listeners: 208,
    isLive: true,
  },
  {
    title: "Beira de Rio",
    artist: "Carlinhos do Acordeon",
    coverUrl: "/mock/capa-3.jpg",
    program: "Tarde Doce",
    listeners: 233,
    isLive: true,
  },
];
