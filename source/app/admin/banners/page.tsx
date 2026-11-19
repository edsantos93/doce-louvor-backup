import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import { BannersTable } from "@/components/admin/BannersTable";
import { PlusIcon } from "@/components/ui/icons";
import { listarBanners } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Banners" };

export default function BannersPage() {
  return (
    <>
      <AdminPageHeader
        title="Banners"
        description="Todas as propagandas do site, com a data em que entram e a data em que saem sozinhas."
        action={
          <Link
            href="/admin/banners/novo"
            className="inline-flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300"
          >
            <PlusIcon className="size-5" />
            Novo banner
          </Link>
        }
      />

      <AdminPageBody>
        <BannersTable banners={listarBanners()} />
      </AdminPageBody>
    </>
  );
}
