import { AD_STATUS, PAYMENT_STATUS, type PaymentStatus } from "@/lib/status";
import type { AdStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: AdStatus;
}

/** Etiqueta colorida do estado de uma peça publicitária. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const visual = AD_STATUS[status];

  return (
    <span
      title={visual.hint}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${visual.className}`}
    >
      {status === "no-ar" ? (
        <span className="animate-live size-1.5 rounded-full bg-current" />
      ) : null}
      {visual.label}
    </span>
  );
}

/** Etiqueta colorida do estado de uma cobrança. */
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const visual = PAYMENT_STATUS[status];

  return (
    <span
      title={visual.hint}
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${visual.className}`}
    >
      {visual.label}
    </span>
  );
}
