import Image from "next/image";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { destaquesNoAr } from "@/lib/repositorio";

/**
 * Coluna da esquerda: propaganda das lojas e matérias em destaque.
 * Imagem grande e poucas palavras — é o espaço que o comércio paga para ter.
 */
export function DestaquesColumn() {
  const [primeiro, ...restantes] = destaquesNoAr();

  return (
    <section id="destaques" aria-labelledby="titulo-destaques">
      <SectionHeading
        id="titulo-destaques"
        title="Destaques"
        hint="Lojas parceiras e matérias escolhidas"
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
        {/* peça de abertura: cartão elevado, imagem cheia */}
        {primeiro ? (
        <article className="overflow-hidden rounded-[var(--dm-radius-lg)] bg-surface-raised shadow-[var(--shadow-card)] sm:col-span-2 xl:col-span-1">
          <Link href={primeiro.href || "#"} className="group block">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-sunken">
              <Image
                src={primeiro.imageUrl}
                alt={primeiro.alt}
                fill
                quality={90}
                sizes="(min-width: 1280px) 272px, (min-width: 640px) 92vw, 92vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-gold-700">
                {primeiro.kind === "loja"
                  ? `Loja parceira · ${primeiro.advertiserName}`
                  : "Em destaque"}
              </p>
              <h3 className="mt-1.5 font-display text-lg leading-snug text-strong group-hover:text-gold-700">
                {primeiro.title}
              </h3>
              <p className="clamp-2 mt-1.5 text-sm text-muted">
                {primeiro.excerpt}
              </p>
            </div>
          </Link>
        </article>
        ) : null}

        <AdSlot
          position="destaque-1"
          className="xl:col-span-1"
          sizes="(min-width: 1280px) 272px, 92vw"
        />

        {restantes.map((destaque) => (
          <article
            key={destaque.id}
            className="border-t border-line-soft pt-5"
          >
            <Link href={destaque.href || "#"} className="group block">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--dm-radius-md)] bg-surface-sunken">
                <Image
                  src={destaque.imageUrl}
                  alt={destaque.alt}
                  fill
                  quality={90}
                  sizes="(min-width: 1280px) 272px, (min-width: 640px) 44vw, 92vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-2xs font-semibold uppercase tracking-[0.14em] text-gold-700">
                {destaque.kind === "loja"
                  ? `Loja parceira · ${destaque.advertiserName}`
                  : "Em destaque"}
              </p>
              <h3 className="mt-1 font-display text-base leading-snug text-strong group-hover:text-gold-700">
                {destaque.title}
              </h3>
              <p className="clamp-2 mt-1 text-sm text-muted">
                {destaque.excerpt}
              </p>
            </Link>
          </article>
        ))}

        <AdSlot
          position="destaque-2"
          className="xl:col-span-1"
          sizes="(min-width: 1280px) 272px, 92vw"
        />
      </div>
    </section>
  );
}
