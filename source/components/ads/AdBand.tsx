import { Container } from "@/components/ui/Container";
import { AdSenseSlot } from "@/components/ads/AdSenseSlot";
import { RotatingBanner } from "@/components/ads/RotatingBanner";
import { AD_SPECS, BAND_LABEL, BAND_SLOT, formatoDeBanner } from "@/lib/ads";
import { obterConfig } from "@/lib/configuracoes";
import { bannersNoAr } from "@/lib/repositorio";
import type { BandPosition } from "@/lib/types";

interface AdBandProps {
  band: BandPosition;
  /** Somente a faixa do topo carrega a imagem com prioridade. */
  priority?: boolean;
}

/**
 * Faixa horizontal de publicidade, uma peça por faixa.
 * A peça tem a medida de mercado (970 × 120) e fica centralizada: não estica
 * na largura toda da página e a arte do anunciante nunca é cortada nem
 * esticada — aparece inteira, do jeito que a loja mandou.
 */
export function AdBand({ band, priority = false }: AdBandProps) {
  const slot = BAND_SLOT[band];
  const spec = AD_SPECS[slot];
  const pecas = bannersNoAr(slot);
  const formato = formatoDeBanner(obterConfig().bannerFormato);

  return (
    <section
      aria-label={`Publicidade — ${BAND_LABEL[band]}`}
      className="border-y border-line-soft bg-surface-sunken py-3 md:py-4"
    >
      <Container>
        <p className="mb-2 text-center text-2xs uppercase tracking-[0.18em] text-muted">
          Publicidade
        </p>

        <div
          className="mx-auto w-full overflow-hidden rounded-[var(--dm-radius-md)]"
          style={{ aspectRatio: formato.proporcao }}
        >
          {spec.kind === "adsense" ? (
            <AdSenseSlot position={slot} className="h-full" />
          ) : pecas.length > 0 ? (
            <div className="relative h-full w-full border border-line-soft bg-surface-raised">
              <RotatingBanner
                creatives={pecas}
                priority={priority}
                sizes="(min-width: 1280px) 1280px, 100vw"
              />
            </div>
          ) : (
            <div
              data-ad-slot={slot}
              className="grid h-full place-items-center rounded-[var(--dm-radius-md)] border-2 border-dashed border-gold-500/50 bg-gold-50"
            >
              <div className="px-3 text-center">
                <p className="font-display text-sm leading-tight text-gold-700 sm:text-base">
                  {spec.label}
                </p>
                <p className="mt-0.5 text-2xs text-muted sm:text-xs">
                  Espaço livre · {formato.medida}
                </p>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
