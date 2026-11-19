import Image from "next/image";
import { AD_SPECS } from "@/lib/ads";
import { bannersNoAr } from "@/lib/repositorio";
import type { AdSlotId } from "@/lib/types";

interface AdSlotProps {
  position: AdSlotId;
  /** Classes extras do contêiner (a faixa define a altura, por exemplo). */
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Espaço publicitário pago (banner, slide ou destaque de loja).
 * Sempre reserva a área da peça: cheio ou vazio, a página não se desloca.
 * Vazio, aparece como moldura tracejada identificada — assim o cliente
 * enxerga no próprio site qual inventário ainda tem para vender.
 */
export function AdSlot({
  position,
  className = "",
  sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 92vw",
  priority = false,
}: AdSlotProps) {
  const spec = AD_SPECS[position];
  const creative = bannersNoAr(position)[0];

  const frame = `relative isolate overflow-hidden rounded-[var(--dm-radius-md)] ${
    spec.fillBand ? "h-full" : ""
  } ${className}`;
  const style = spec.fillBand ? undefined : { aspectRatio: spec.ratio };

  if (!creative) {
    return (
      <div
        data-ad-slot={position}
        style={style}
        className={`${frame} grid place-items-center border-2 border-dashed border-gold-500/50 bg-gold-50`}
      >
        <div className="px-3 text-center">
          <p className="font-display text-sm leading-tight text-gold-700 sm:text-base">
            {spec.label}
          </p>
          <p className="mt-0.5 text-2xs text-muted sm:text-xs">
            Espaço livre · {spec.recommended}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ad-slot={position}
      style={style}
      className={`${frame} border border-line-soft bg-surface-sunken`}
    >
      <a
        href={creative.href}
        target="_blank"
        rel="noopener sponsored"
        className="group block h-full w-full"
      >
        {/* banner vai sem recompressão; destaque é foto grande e vale
            reduzir para a página abrir rápido */}
        <Image
          src={creative.imageUrl}
          alt={creative.alt}
          fill
          unoptimized={spec.kind === "banner"}
          quality={90}
          sizes={sizes}
          priority={priority}
          className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-0 top-0 rounded-br-[var(--dm-radius-sm)] bg-ink-950/75 px-1.5 py-0.5 text-2xs uppercase tracking-[0.14em] text-gold-300">
          Publicidade
        </span>
      </a>
    </div>
  );
}
