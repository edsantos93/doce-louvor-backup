import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import { BannerForm } from "@/components/admin/BannerForm";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { formatoDeBanner } from "@/lib/ads";
import { obterConfig } from "@/lib/configuracoes";
import { listarAnunciantes } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Novo banner" };

export default function NovoBannerPage() {
  return (
    <>
      <AdminPageHeader
        title="Novo banner"
        description="Envie a arte, escolha o lugar e diga por quanto tempo fica no ar. O resto é automático."
        action={
          <Link
            href="/admin/banners"
            className="inline-flex items-center gap-1.5 rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3.5 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
          >
            <ChevronLeftIcon className="size-5" />
            Voltar para a lista
          </Link>
        }
      />

      <AdminPageBody>
        <BannerForm
          anunciantes={listarAnunciantes()}
          medidaDaFaixa={formatoDeBanner(obterConfig().bannerFormato).medida}
        />
      </AdminPageBody>
    </>
  );
}
