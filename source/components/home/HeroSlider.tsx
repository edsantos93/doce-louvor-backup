"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { Slide } from "@/lib/types";

interface HeroSliderProps {
  slides: Slide[];
  /** Tempo entre trocas automáticas, em milissegundos. */
  interval?: number;
}

/**
 * Carrossel principal: passa sozinho, aceita arrasto no celular e mostra as
 * setas quando o mouse está em cima.
 * Mostra só a arte do anunciante — sem texto por cima — porque a peça já
 * traz tudo o que o ouvinte precisa ler. O clique abre o link do anunciante.
 */
export function HeroSlider({ slides, interval = 6000 }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStart = useRef<number | null>(null);
  const total = slides.length;

  const goTo = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  );

  useEffect(() => {
    if (paused || total < 2) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % total),
      interval,
    );
    return () => window.clearInterval(timer);
  }, [paused, total, interval]);

  if (total === 0) return null;

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragStart.current = event.clientX;
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return;
    const delta = event.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(delta) > 45) goTo(delta < 0 ? index + 1 : index - 1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") goTo(index + 1);
    if (event.key === "ArrowLeft") goTo(index - 1);
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques dos anunciantes"
      className="group relative overflow-hidden rounded-[var(--dm-radius-lg)] bg-ink-950 shadow-[var(--shadow-lift)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        role="group"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative aspect-[16/9] w-full touch-pan-y xl:aspect-[2/1]"
      >
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => {
            const arte = (
              <Image
                src={slide.imageUrl}
                alt={slide.alt || slide.title}
                fill
                quality={90}
                priority={slideIndex === 0}
                sizes="(min-width: 1280px) 680px, (min-width: 768px) 66vw, 100vw"
                className="object-cover"
              />
            );

            return (
              <article
                key={slide.id}
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} de ${total}: ${slide.title}`}
                aria-hidden={slideIndex !== index}
                className="relative h-full w-full shrink-0"
              >
                {slide.href ? (
                  <Link
                    href={slide.href}
                    target={
                      slide.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel="noopener"
                    tabIndex={slideIndex === index ? 0 : -1}
                    className="block h-full w-full"
                  >
                    {arte}
                  </Link>
                ) : (
                  arte
                )}
              </article>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-ink-950/70 text-cream-100 opacity-0 transition-opacity hover:bg-ink-950 focus-visible:opacity-100 group-hover:opacity-100 md:grid"
      >
        <ChevronLeftIcon className="size-6" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Próximo slide"
        className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-ink-950/70 text-cream-100 opacity-0 transition-opacity hover:bg-ink-950 focus-visible:opacity-100 group-hover:opacity-100 md:grid"
      >
        <ChevronRightIcon className="size-6" />
      </button>

      {total > 1 ? (
        <div className="absolute bottom-3 right-4 flex gap-1.5 sm:bottom-4">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(slideIndex)}
              aria-label={`Ir para o slide ${slideIndex + 1}`}
              aria-current={slideIndex === index}
              className={`h-1.5 rounded-full transition-all ${
                slideIndex === index
                  ? "w-7 bg-gold-400"
                  : "w-3 bg-cream-100/60 hover:bg-cream-100/90"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
