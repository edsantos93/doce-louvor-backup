"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import type { AdCreative } from "@/lib/types";

interface RotatingBannerProps {
  creatives: AdCreative[];
  /** Tempo de cada anunciante no ar, em milissegundos (padrão: lib/site.ts). */
  interval?: number;
  sizes?: string;
  priority?: boolean;
}

/**
 * Banner rotativo: quando há mais de um anunciante contratado para o mesmo
 * espaço, as artes se revezam sozinhas. Com um anunciante só, fica parado.
 */
export function RotatingBanner({
  creatives,
  interval = site.bannerRotationSeconds * 1000,
  sizes = "(min-width: 1280px) 1280px, 100vw",
  priority = false,
}: RotatingBannerProps) {
  const [indice, setIndice] = useState(0);
  const total = creatives.length;

  useEffect(() => {
    if (total < 2) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tempo = reduzido.matches ? interval * 2 : interval;

    const timer = window.setInterval(
      () => setIndice((atual) => (atual + 1) % total),
      tempo,
    );
    return () => window.clearInterval(timer);
  }, [total, interval]);

  return (
    <div className="relative h-full w-full">
      {creatives.map((creative, posicao) => (
        <a
          key={creative.id}
          href={creative.href}
          target="_blank"
          rel="noopener sponsored"
          aria-hidden={posicao !== indice}
          tabIndex={posicao === indice ? 0 : -1}
          className={`group absolute inset-0 block transition-opacity duration-700 ${
            posicao === indice ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {/* unoptimized: o arquivo do anunciante vai inteiro, do jeito que
              ele mandou. Sem recompressão e sem o navegador ampliar uma arte
              de 970 px para 1080 ou 1920, que era o que deixava borrado. */}
          <Image
            src={creative.imageUrl}
            alt={creative.alt}
            fill
            unoptimized
            sizes={sizes}
            priority={priority && posicao === 0}
            className="object-contain"
          />
        </a>
      ))}

      <span className="pointer-events-none absolute left-0 top-0 rounded-br-[var(--dm-radius-sm)] bg-ink-950/75 px-1.5 py-0.5 text-2xs uppercase tracking-[0.14em] text-gold-300">
        Publicidade
      </span>

      {total > 1 ? (
        <div className="pointer-events-none absolute bottom-2 right-3 flex gap-1">
          {creatives.map((creative, posicao) => (
            <span
              key={creative.id}
              className={`h-1.5 rounded-full transition-all ${
                posicao === indice ? "w-5 bg-gold-400" : "w-1.5 bg-cream-100/60"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
