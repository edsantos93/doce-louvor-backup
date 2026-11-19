import type { AdStatus } from "@/lib/types";

export interface StatusVisual {
  label: string;
  /** Classes da etiqueta colorida. */
  className: string;
  /** Explicação em português simples, usada em dicas e legendas. */
  hint: string;
}

export const AD_STATUS: Record<AdStatus, StatusVisual> = {
  "no-ar": {
    label: "No ar",
    className: "bg-success-soft text-success",
    hint: "Aparecendo no site agora.",
  },
  agendado: {
    label: "Agendado",
    className: "bg-info-soft text-info",
    hint: "Entra sozinho na data de início.",
  },
  expirado: {
    label: "Expirado",
    className: "bg-cream-200 text-muted",
    hint: "Saiu do site sozinho na data de fim.",
  },
  "aguardando-pagamento": {
    label: "Aguardando pagamento",
    className: "bg-warn-soft text-warn",
    hint: "Só entra no ar depois que o pagamento cair.",
  },
};

export type PaymentStatus = "pago" | "aguardando" | "vencido";

export const PAYMENT_STATUS: Record<PaymentStatus, StatusVisual> = {
  pago: {
    label: "Pago",
    className: "bg-success-soft text-success",
    hint: "Pagamento confirmado pelo Mercado Pago.",
  },
  aguardando: {
    label: "Aguardando pagamento",
    className: "bg-warn-soft text-warn",
    hint: "A cobrança foi enviada e ainda não foi paga.",
  },
  vencido: {
    label: "Vencido",
    className: "bg-danger-soft text-danger",
    hint: "O prazo da cobrança passou sem pagamento.",
  },
};
