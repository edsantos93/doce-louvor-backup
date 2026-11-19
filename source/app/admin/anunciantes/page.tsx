import type { Metadata } from "next";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import {
  AdvertisersManager,
  type AdHistoryEntry,
} from "@/components/admin/AdvertisersManager";
import { AD_SPECS } from "@/lib/ads";
import { formatBRL, formatPeriod } from "@/lib/format";
import { listarAnunciantes, listarBanners } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Anunciantes" };

export default function AnunciantesPage() {
  const historico: Record<string, AdHistoryEntry[]> = {};

  for (const banner of listarBanners()) {
    if (!banner.advertiserId) continue;

    historico[banner.advertiserId] = [
      ...(historico[banner.advertiserId] ?? []),
      {
        id: banner.id,
        label: AD_SPECS[banner.slot]?.label ?? banner.slot,
        period: formatPeriod(banner.startDate, banner.endDate),
        value: formatBRL(banner.priceCents),
        status: banner.status,
      },
    ];
  }

  return (
    <>
      <AdminPageHeader
        title="Anunciantes"
        description="As lojas que anunciam na rádio, com o contato de cada uma e tudo o que já contrataram."
      />

      <AdminPageBody>
        <AdvertisersManager
          advertisers={listarAnunciantes()}
          history={historico}
        />
      </AdminPageBody>
    </>
  );
}
