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
import { listarVideos } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Vídeos" };


export default function VideosPage() {
  const itens: ReorderableItem[] = listarVideos().map((video) => ({
    id: video.id,
    title: video.title,
    subtitle: `Duração ${video.duration}`,
    imageUrl: video.thumbUrl,
    alt: video.alt,
    startDate: video.publishedAt.slice(0, 10),
    endDate: "2026-12-31",
    status: "no-ar" as const,
  }));

  return (
    <>
      <AdminPageHeader
        title="Vídeos"
        description="A faixa de vídeos que aparece na parte de baixo da página inicial."
        action={
          <Link
            href="/admin/videos/novo"
            className="inline-flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300"
          >
            <PlusIcon className="size-5" />
            Novo vídeo
          </Link>
        }
      />

      <AdminPageBody>
        <ReorderableList items={itens} noun="vídeo" tabela="videos" />
      </AdminPageBody>
    </>
  );
}
