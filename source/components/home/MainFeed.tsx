import Image from "next/image";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";
import { formatRelative } from "@/lib/format";
import type { Post } from "@/lib/types";

interface MainFeedProps {
  posts: Post[];
}

/** Feed principal da coluna central: uma matéria de abertura e a lista. */
export function MainFeed({ posts }: MainFeedProps) {
  const [abertura, ...lista] = posts;

  return (
    <section id="feed" aria-labelledby="titulo-feed">
      <SectionHeading
        id="titulo-feed"
        title="Da rádio"
        hint="O que aconteceu no ar e nos bastidores"
        action={
          <Link
            href="/#feed"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-link)] hover:text-gold-600"
          >
            Todas as matérias
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />

      <article className="group">
        <Link href={abertura.href} className="block">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--dm-radius-lg)] bg-surface-sunken">
            <Image
              src={abertura.imageUrl}
              alt={abertura.alt}
              fill
              quality={90}
              sizes="(min-width: 1280px) 680px, (min-width: 768px) 66vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <p className="mt-4 text-2xs font-semibold uppercase tracking-[0.16em] text-gold-700">
            {abertura.category}
          </p>
          <h3 className="mt-1.5 font-display text-2xl leading-tight text-strong group-hover:text-gold-700">
            {abertura.title}
          </h3>
          <p className="clamp-3 mt-2 text-base text-body">{abertura.excerpt}</p>
          <p className="mt-2 text-xs text-muted">
            {abertura.author} · {formatRelative(abertura.publishedAt)}
          </p>
        </Link>
      </article>

      <ul className="mt-7 space-y-6">
        {lista.map((post, index) => (
          <li key={post.id}>
            {index === 2 ? (
              <AdSlot
                position="feed-inline"
                className="mb-6"
                sizes="(min-width: 1280px) 680px, (min-width: 768px) 66vw, 92vw"
              />
            ) : null}
            <article className="group grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-t border-line-soft pt-6 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-5">
              <Link
                href={post.href}
                className="relative aspect-[4/3] overflow-hidden rounded-[var(--dm-radius-md)] bg-surface-sunken"
                tabIndex={-1}
                aria-hidden
              >
                <Image
                  src={post.imageUrl}
                  alt=""
                  fill
                  quality={90}
                  sizes="(min-width: 640px) 192px, 120px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div>
                <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                  {post.category}
                </p>
                <h3 className="mt-1 font-display text-lg leading-snug text-strong group-hover:text-gold-700">
                  <Link href={post.href}>{post.title}</Link>
                </h3>
                <p className="clamp-2 mt-1.5 text-sm text-muted sm:text-base">
                  {post.excerpt}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {post.author} · {formatRelative(post.publishedAt)}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
