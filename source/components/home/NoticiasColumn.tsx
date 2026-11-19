import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDate, formatTime } from "@/lib/format";
import { listarFontes } from "@/lib/repositorio";
import { ultimaBusca } from "@/lib/rss";
import type { NewsItem } from "@/lib/types";

/**
 * Coluna da direita: as notícias que chegam sozinhas dos sites cadastrados.
 * Foto da matéria em cima, manchete embaixo, e o clique abre a notícia no
 * site de origem.
 */
interface NoticiasColumnProps {
  items: NewsItem[];
}

export function NoticiasColumn({ items }: NoticiasColumnProps) {
  const lista = items;
  const ativas = listarFontes().filter((fonte) => fonte.active).length;
  const quando = ultimaBusca();

  return (
    <section id="noticias" aria-labelledby="titulo-noticias">
      <SectionHeading
        id="titulo-noticias"
        title="Notícias"
        hint="Atualização automática"
        size="sm"
      />

      {lista.length === 0 ? (
        <p className="rounded-[var(--dm-radius-md)] border border-dashed border-line-strong bg-surface-sunken px-4 py-6 text-sm text-muted">
          As notícias aparecem aqui assim que os sites cadastrados forem
          buscados pela primeira vez.
        </p>
      ) : (
        <ul className="space-y-6">
          {lista.map((noticia) => (
            <li
              key={noticia.id}
              className="border-b border-line-soft pb-6 last:border-b-0 last:pb-0"
            >
              <a
                href={noticia.href}
                target="_blank"
                rel="noopener"
                className="group block"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--dm-radius-md)] bg-surface-sunken">
                  <Image
                    src={noticia.thumbUrl}
                    alt={noticia.alt}
                    fill
                    quality={90}
                    sizes="(min-width: 1280px) 320px, (min-width: 768px) 34vw, 92vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-2 top-2 rounded-[var(--dm-radius-xs)] bg-ink-950/85 px-2 py-1 text-2xs font-semibold uppercase tracking-[0.12em] text-gold-300">
                    {noticia.category}
                  </span>
                </div>

                <h3 className="mt-2.5 font-sans text-base font-bold leading-snug text-strong group-hover:text-gold-700">
                  {noticia.title}
                </h3>
                {noticia.excerpt ? (
                  <p className="clamp-2 mt-1 text-sm text-muted">
                    {noticia.excerpt}
                  </p>
                ) : null}
                <p className="mt-1.5 text-xs text-muted">
                  {noticia.source} · {formatDate(noticia.publishedAt)} ·{" "}
                  {formatTime(noticia.publishedAt)}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-2xs text-muted">
        {ativas} {ativas === 1 ? "site" : "sites"} de notícia
        {quando
          ? ` · última busca às ${formatTime(quando)}`
          : " · aguardando a primeira busca"}
      </p>
    </section>
  );
}
