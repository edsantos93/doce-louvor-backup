import type { Metadata } from "next";
import { AdBand } from "@/components/ads/AdBand";
import { DestaquesColumn } from "@/components/home/DestaquesColumn";
import { HeroSlider } from "@/components/home/HeroSlider";
import { MainFeed } from "@/components/home/MainFeed";
import { NewsStrip } from "@/components/home/NewsStrip";
import { NoticiasColumn } from "@/components/home/NoticiasColumn";
import { SecondaryFeed } from "@/components/home/SecondaryFeed";
import { VideoGallery } from "@/components/home/VideoGallery";
import { Container } from "@/components/ui/Container";
import { noticiasComFoto } from "@/lib/rss";
import { posts } from "@/lib/mock/posts";
import { obterConfig, whatsappLimpo } from "@/lib/configuracoes";
import { listarVideos, slidesNoAr } from "@/lib/repositorio";
import { site } from "@/lib/site";

// a home é gerada pronta e revista a cada 5 minutos
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const config = obterConfig();

  return {
    // absolute: a home não repete o nome da rádio no fim do título
    title: { absolute: config.seoTitulo },
    description: config.seoDescricao,
    alternates: { canonical: "/" },
  };
}

/** A ficha da rádio que o Google lê, com os dados do painel. */
function fichaDaRadio(config: ReturnType<typeof obterConfig>) {
  const redes = [config.instagram, config.facebook, config.youtube].filter(
    Boolean,
  );
  const telefone = whatsappLimpo(config.whatsapp);

  return {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    name: config.nomeDaRadio,
    url: config.siteUrl || site.url,
    slogan: site.slogan,
    description: config.seoDescricao,
    inLanguage: "pt-BR",
    logo: `${config.siteUrl || site.url}/logo.png`,
    image: `${config.siteUrl || site.url}/og-image.jpg`,
    ...(config.email ? { email: config.email } : {}),
    ...(telefone ? { telephone: `+${telefone}` } : {}),
    areaServed: site.city,
    ...(redes.length > 0 ? { sameAs: redes } : {}),
    broadcastAffiliateOf: { "@type": "Organization", name: "BR Logic" },
    ...(config.streamUrl
      ? { potentialAction: { "@type": "ListenAction", target: config.streamUrl } }
      : {}),
  };
}

export default function HomePage() {
  const jsonLd = fichaDaRadio(obterConfig());
  // só as que têm foto: as tiras e a coluna ficam com imagem de verdade
  const noticias = noticiasComFoto(14);
  const slides = slidesNoAr();
  const videos = listarVideos();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1ª faixa de publicidade */}
      <AdBand band="topo" priority />

      {/* notícias separam as faixas: nunca duas faixas coladas */}
      <NewsStrip title="Giro de notícias" items={noticias.slice(6, 10)} />

      <Container>
        <div className="grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_17rem] md:gap-x-8 md:py-10 xl:grid-cols-[17rem_minmax(0,1fr)_19rem] xl:grid-rows-[min-content_1fr]">
          <div className="min-w-0 md:col-start-1 md:row-start-1 xl:col-start-2 xl:row-start-1">
            <HeroSlider slides={slides} />
          </div>

          <div className="min-w-0 md:col-start-1 md:row-start-2 xl:col-start-1 xl:row-start-1 xl:row-span-2">
            <DestaquesColumn />
          </div>

          <div className="min-w-0 md:col-start-1 md:row-start-3 xl:col-start-2 xl:row-start-2">
            <MainFeed posts={posts.slice(0, 4)} />
          </div>

          <aside className="min-w-0 md:col-start-2 md:row-start-1 md:row-span-3 xl:col-start-3 xl:row-start-1 xl:row-span-2">
            <div className="xl:sticky xl:top-24">
              <NoticiasColumn items={noticias.slice(0, 6)} />
            </div>
          </aside>
        </div>
      </Container>

      {/* 2ª faixa de publicidade */}
      <AdBand band="meio" />

      <NewsStrip
        title="Mais lidas do dia"
        items={noticias.slice(10, 14)}
        tone="escuro"
      />

      <SecondaryFeed posts={posts.slice(4)} />

      {/* faixa de vídeos, como no desenho do cliente */}
      <VideoGallery videos={videos} />

      {/* 3ª faixa de publicidade */}
      <AdBand band="rodape" />
    </>
  );
}
