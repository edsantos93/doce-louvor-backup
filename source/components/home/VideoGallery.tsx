import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlayIcon } from "@/components/ui/icons";
import { formatRelative } from "@/lib/format";
import type { VideoItem } from "@/lib/types";

interface VideoGalleryProps {
  videos: VideoItem[];
}

/**
 * Faixa de vídeos da página inicial, largura toda.
 * No celular vira um trilho que desliza para o lado.
 */
export function VideoGallery({ videos }: VideoGalleryProps) {
  // sem vídeos cadastrados, a faixa inteira sai do site
  if (videos.length === 0) return null;

  return (
    <section
      aria-labelledby="titulo-videos"
      className="border-t border-line-soft bg-surface-sunken py-10 md:py-12"
    >
      <Container>
        <SectionHeading
          id="titulo-videos"
          title="Vídeos"
          hint="Matérias e bastidores em vídeo"
        />

        <ul className="scroll-snap-x -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-6">
          {videos.map((video) => (
            <li
              key={video.id}
              className="w-[68%] shrink-0 snap-start sm:w-auto"
            >
              <a
                href={video.href || "#"}
                target={video.href ? "_blank" : undefined}
                rel="noopener"
                className="group block"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-[var(--dm-radius-md)] bg-ink-900">
                  <Image
                    src={video.thumbUrl}
                    alt={video.alt}
                    fill
                    quality={90}
                    sizes="(min-width: 1280px) 200px, (min-width: 640px) 33vw, 68vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-11 place-items-center rounded-full bg-ink-950/70 text-cream-50 transition-colors group-hover:bg-gold-400 group-hover:text-on-brand">
                      <PlayIcon className="ml-0.5 size-5" />
                    </span>
                  </span>
                  <span className="absolute bottom-2 right-2 rounded-[var(--dm-radius-xs)] bg-ink-950/85 px-1.5 py-0.5 text-2xs font-semibold text-cream-50">
                    {video.duration}
                  </span>
                </div>
                <h3 className="clamp-2 mt-2 text-sm font-semibold leading-snug text-strong group-hover:text-gold-700">
                  {video.title}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {formatRelative(video.publishedAt)}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
