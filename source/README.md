# Doce Melodia — site da rádio

Site da rádio online **Doce Melodia** (docemelodia.net). O áudio é transmitido
pela BR Logic; o site embute o player e cuida do conteúdo, dos anúncios e do
painel de gerenciamento.

## Tecnologia

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4, com os tokens da marca em `app/globals.css`
- Imagens otimizadas por `next/image`, todas com espaço reservado

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção
npm run lint
```

Para regerar as imagens de demonstração e as versões do logotipo:

```bash
node scripts/gen-mock-images.mjs
```

## Estrutura

```
app/                 páginas, metadados, sitemap e robots
components/
  admin/             telas do painel: tabela, formulários, agenda, PIX
  ads/               AdSlot (venda direta) e AdSenseSlot (Google)
  home/              slider, feed, colunas de destaques e notícias
  layout/            cabeçalho, rodapé, botão de WhatsApp
  player/            barra fixa do player e hook de "tocando agora"
  contact/           formulário de contato
  ui/                container, títulos de seção, ícones
lib/
  types.ts           contrato de dados (o mesmo que a API vai preencher)
  ads.ts             cadastro dos espaços publicitários da página
  mock/              dados de demonstração
scripts/             geração de imagens e ferramentas de verificação
```

## Marca

Paleta tirada do logotipo: ouro (`#d9a62c`), ébano (`#14100b`) e papel creme
(`#fcfaf5`). Tipografia: **Bodoni Moda** nos títulos e **Figtree** no texto.
Nenhum componente usa cor fixa — tudo passa pelas variáveis de
`app/globals.css`.

## Espaços publicitários

Cada posição da página é um `<AdSlot position="..." />`. Quando não há peça
vendida, o espaço aparece com moldura tracejada e a medida recomendada, para
ficar visível qual inventário ainda está livre. As três faixas horizontais
(topo, meio e rodapé) trazem banner, slide e AdSense lado a lado, e nunca ficam
coladas: sempre há uma tira de notícias entre elas.

## Situação atual

Pronto: site público completo (home, contato, player, WhatsApp, SEO,
responsividade verificada em 375, 768 e 1280 px) e painel administrativo em
/admin com Banners, Slides, Destaques, Notícias, Anunciantes e Pagamentos.
Tudo funciona sobre dados de demonstração.

Pendente: banco de dados, login do painel, leitura real dos feeds RSS, envio do
formulário de contato e a integração de verdade com o Mercado Pago.

## Configuração a preencher

Em `lib/site.ts`: endereço do stream da BR Logic, WhatsApp, e-mail e redes
sociais da rádio.
