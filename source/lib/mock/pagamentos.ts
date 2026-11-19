import type { PaymentStatus } from "@/lib/status";

export interface Payment {
  id: string;
  advertiserId: string;
  advertiserName: string;
  /** O que está sendo cobrado, em português comum. */
  description: string;
  valueCents: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
  /** Código copia e cola do PIX (Mercado Pago). */
  pixCode: string;
}

const CODIGO_EXEMPLO =
  "00020126580014BR.GOV.BCB.PIX0136f1e2c3a4-55d6-47b8-9f01-2a3b4c5d6e7f5204000053039865802BR5913DOCE MELODIA6009SAO PAULO62070503***6304A1B2";

export const payments: Payment[] = [
  {
    id: "pag-01",
    advertiserId: "anu-01",
    advertiserName: "Padaria Pão Quente",
    description: "Banner no topo — setembro",
    valueCents: 18000,
    status: "pago",
    createdAt: "2026-08-20T09:12:00-03:00",
    paidAt: "2026-08-20T09:31:00-03:00",
    pixCode: CODIGO_EXEMPLO,
  },
  {
    id: "pag-02",
    advertiserId: "anu-02",
    advertiserName: "Ótica Visão Clara",
    description: "Banner no meio das matérias — setembro",
    valueCents: 11000,
    status: "aguardando",
    createdAt: "2026-08-26T15:40:00-03:00",
    paidAt: null,
    pixCode: CODIGO_EXEMPLO,
  },
  {
    id: "pag-03",
    advertiserId: "anu-06",
    advertiserName: "Salão Beleza Real",
    description: "Slide no meio — setembro",
    valueCents: 13000,
    status: "aguardando",
    createdAt: "2026-08-25T11:05:00-03:00",
    paidAt: null,
    pixCode: CODIGO_EXEMPLO,
  },
  {
    id: "pag-04",
    advertiserId: "anu-04",
    advertiserName: "Mercado Bom Preço",
    description: "Slide no rodapé — agosto",
    valueCents: 12000,
    status: "pago",
    createdAt: "2026-08-18T08:20:00-03:00",
    paidAt: "2026-08-18T10:02:00-03:00",
    pixCode: CODIGO_EXEMPLO,
  },
  {
    id: "pag-05",
    advertiserId: "anu-05",
    advertiserName: "Casa & Cia Móveis",
    description: "Destaque na coluna da esquerda — julho",
    valueCents: 9000,
    status: "vencido",
    createdAt: "2026-07-10T14:00:00-03:00",
    paidAt: null,
    pixCode: CODIGO_EXEMPLO,
  },
];

export { CODIGO_EXEMPLO as pixCodeExemplo };
