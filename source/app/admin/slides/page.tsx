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
import { listarSlides } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Slides" };


export default function SlidesPage() {
  const itens: ReorderableItem[] = listarSlides().map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.href
      ? `Link: ${slide.href}`
      : "Sem link — o slide não é clicável",
    imageUrl: slide.imageUrl,
    alt: slide.alt,
    startDate: slide.startDate,
    endDate: slide.endDate,
    status: slide.status,
  }));

  return (
    <>
      <AdminPageHeader
        title="Slides"
        description="As artes que passam sozinhas no alto da página. Aparece só a imagem do anunciante, com o link dele."
        action={
          <Link
            href="/admin/slides/novo"
            className="inline-flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300"
          >
            <PlusIcon className="size-5" />
            Novo slide
          </Link>
        }
      />

      <AdminPageBody>
        <ReorderableList items={itens} noun="slide" tabela="slides" />
      </AdminPageBody>
    </>
  );
}
