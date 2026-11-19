import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import {
  ReorderableList,
  type ReorderableItem,
} from "@/components/admin/ReorderableList";
import { PlusIcon } from "@/components/ui/icons";
import { listarDestaques } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Destaques" };


export default function DestaquesPage() {
  const itens: ReorderableItem[] = listarDestaques().map((destaque) => ({
    id: destaque.id,
    title: destaque.title,
    subtitle:
      destaque.kind === "loja"
        ? `Loja parceira · ${destaque.advertiserName ?? ""}`
        : destaque.excerpt,
    imageUrl: destaque.imageUrl,
    alt: destaque.alt,
    startDate: destaque.startDate,
    endDate: destaque.endDate,
    status: destaque.status,
  }));

  return (
    <>
      <AdminPageHeader
        title="Destaques"
        description="A coluna da esquerda do site: propaganda das lojas e as matérias que você quer em evidência."
        action={
          <Link
            href="/admin/destaques/novo"
            className="inline-flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300"
          >
            <PlusIcon className="size-5" />
            Novo destaque
          </Link>
        }
      />

      <AdminPageBody>
        <ReorderableList items={itens} noun="destaque" tabela="destaques" />
      </AdminPageBody>
    </>
  );
}
