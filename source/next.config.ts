import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // As fotos das notícias vêm dos sites cadastrados no painel (G1, Agência
    // Brasil, jornais da região...), então o endereço não é fixo.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],

    // Menos larguras no srcset. Com a lista padrão o Next escrevia 16
    // endereços por foto, e como o endereço de uma foto do G1 é enorme, só
    // isso somava 63 KB no HTML da página inicial — peso puro no celular.
    // Estas larguras cobrem do celular ao monitor grande.
    // 384 existe por causa do celular: a manchete ocupa cerca de 345 px de
    // largura, e sem esta medida o navegador era obrigado a baixar a versão
    // de 640 px para cada uma das 20 fotos da página.
    deviceSizes: [384, 640, 1200, 1920],
    imageSizes: [256],

    // Qualidades usadas no site. O Next 16 vai exigir esta lista; declarar
    // aqui evita o aviso e trava o que é permitido. 65 nas fotos de notícia
    // (imperceptível no thumbnail e mais leve no celular), 80 no slide da
    // capa e 90 na arte paga do anunciante, que não pode perder nitidez.
    qualities: [65, 80, 90],

    // A foto já otimizada fica guardada 30 dias em vez de 60 segundos:
    // a mesma manchete não é reprocessada a cada visita.
    minimumCacheTTL: 2_592_000,
  },

  // O cabeçalho "X-Powered-By" não serve para nada e vai em toda resposta.
  poweredByHeader: false,

  compress: true,

  experimental: {
    serverActions: {
      // O padrão do Next é 1 MB, e o envio da arte passa por uma server
      // action: banner de anunciante quase sempre passa disso, então o
      // envio era recusado antes de chegar no nosso código — nem a
      // mensagem de "máximo 5 MB" aparecia. Vale para o painel e para o
      // anunciante que manda a arte depois de pagar.
      bodySizeLimit: "14mb",
    },
  },
};

export default nextConfig;
