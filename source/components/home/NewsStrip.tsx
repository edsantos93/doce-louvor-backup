import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { formatRelative } from "@/lib/format";
import type { NewsItem } from "@/lib/types";

interface NewsStripProps {
  title: string;
  items: NewsItem[];
  /** Alterna o tom da faixa para as faixas de anúncio nunca ficarem coladas. */
  tone?: "claro" | "escuro";
}

/**
 * Tira de notícias que separa duas faixas de publicidade: foto pequena,
 * manchete e a hora. O clique abre a matéria no site de origem.
 */
export function NewsStrip({ title, items, tone = "claro" }: NewsStripProps) {
  const dark = tone === "escuro";
  if (items.length === 0) return null;

  return (
    <section
      aria-label={title}
      className={
        dark
          ? "bg-surface-inverse py-6 text-on-inverse md:py-7"
          : "border-b border-line-soft bg-surface py-6 md:py-7"
      }
    >
      <Container>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2
            className={`font-display text-xl ${dark ? "text-gold-300" : "text-strong"}`}
          >
            {title}
          </h2>
          <a
            href="#noticias"
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${
              dark
                ? "text-on-inverse-muted hover:text-gold-300"
                : "text-[var(--text-link)] hover:text-gold-600"
            }`}
          >
            Ver todas
            <ArrowRightIcon className="size-4" />
          </a>
        </div>

        <ul className="scroll-snap-x -mx-4 flex gap-5 overflow-x-auto px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5 md:overflow-visible lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="w-[72%] shrink-0 snap-start md:w-auto">
              <a
                href={item.href}
                target="_blank"
                rel="noopener"
                className="group flex gap-3"
              >
                {item.thumbUrl ? (
                  <div
                    className={`relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-[var(--dm-radius-sm)] sm:w-36 ${
                      dark ? "bg-ink-900" : "bg-surface-sunken"
                    }`}
                  >
                    <Image
                      src={item.thumbUrl}
                      alt={item.alt}
                      fill
                      quality={90}
                      sizes="(min-width: 640px) 144px, 128px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : null}

                <div className="min-w-0">
                  <h3
                    className={`clamp-3 text-sm font-semibold leading-snug ${
                      dark
                        ? "text-on-inverse group-hover:text-gold-300"
                        : "text-strong group-hover:text-gold-700"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-1.5 truncate text-xs ${dark ? "text-on-inverse-muted" : "text-muted"}`}
                  >
                    {item.source} · {formatRelative(item.publishedAt, new Date())}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
