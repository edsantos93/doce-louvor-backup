import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatRelative } from "@/lib/format";
import type { Post } from "@/lib/types";

interface SecondaryFeedProps {
  posts: Post[];
}

/**
 * Bloco largo depois da faixa do meio. A primeira matéria ocupa o dobro
 * do espaço e vem deitada — a grade não fica com três cartões iguais.
 */
export function SecondaryFeed({ posts }: SecondaryFeedProps) {
  const [larga, ...outras] = posts;

  return (
    <section
      aria-labelledby="titulo-secundario"
      className="bg-surface py-10 md:py-12"
    >
      <Container>
        <SectionHeading
          id="titulo-secundario"
          title="Também no ar"
          hint="Programação, bastidores e recados dos ouvintes"
        />

        <div className="grid gap-8 lg:grid-cols-3">
          <article className="group lg:col-span-2">
            <Link href={larga.href} className="grid gap-5 sm:grid-cols-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--dm-radius-lg)] bg-surface-sunken">
                <Image
                  src={larga.imageUrl}
                  alt={larga.alt}
                  fill
                  quality={90}
                  sizes="(min-width: 1024px) 420px, (min-width: 640px) 46vw, 92vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="self-center">
                <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                  {larga.category}
                </p>
                <h3 className="mt-1.5 font-display text-xl leading-snug text-strong group-hover:text-gold-700 sm:text-2xl">
                  {larga.title}
                </h3>
                <p className="clamp-3 mt-2 text-sm text-body sm:text-base">
                  {larga.excerpt}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {larga.author} · {formatRelative(larga.publishedAt)}
                </p>
              </div>
            </Link>
          </article>

          <ul className="space-y-6 lg:border-l lg:border-line-soft lg:pl-8">
            {outras.map((post) => (
              <li key={post.id} className="group">
                <Link href={post.href} className="flex gap-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-[var(--dm-radius-md)] bg-surface-sunken sm:size-24">
                    <Image
                      src={post.imageUrl}
                      alt=""
                      fill
                      quality={90}
                      sizes="96px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                      {post.category}
                    </p>
                    <h3 className="clamp-3 mt-1 font-display text-base leading-snug text-strong group-hover:text-gold-700">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {formatRelative(post.publishedAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
