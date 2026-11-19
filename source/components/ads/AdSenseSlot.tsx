import { AD_SPECS } from "@/lib/ads";
import type { AdSlotId } from "@/lib/types";

interface AdSenseSlotProps {
  position: AdSlotId;
  className?: string;
}

/**
 * Espaço do Google AdSense — componente separado dos banners vendidos
 * diretamente, porque o código vem do Google e não é editado no painel.
 * Enquanto a conta não está aprovada, mostra a moldura reservada com a
 * área exata que o anúncio vai ocupar.
 */
export function AdSenseSlot({ position, className = "" }: AdSenseSlotProps) {
  const spec = AD_SPECS[position];

  return (
    <div
      data-adsense-slot={position}
      style={spec.fillBand ? undefined : { aspectRatio: spec.ratio }}
      className={`relative grid place-items-center overflow-hidden rounded-[var(--dm-radius-md)] border-2 border-dashed border-ink-300 bg-surface-sunken ${
        spec.fillBand ? "h-full" : ""
      } ${className}`}
    >
      <div className="px-3 text-center">
        <p className="text-2xs uppercase tracking-[0.16em] text-muted">
          Google AdSense
        </p>
        <p className="mt-1 font-display text-sm leading-tight text-strong sm:text-base">
          Anúncio automático
        </p>
      </div>
    </div>
  );
}
