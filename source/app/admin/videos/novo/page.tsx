import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import { PecaForm } from "@/components/admin/PecaForm";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { listarAnunciantes } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Novo vídeo" };

export default function NovoVídeosPage() {
  return (
    <>
      <AdminPageHeader
        title="Novo vídeo"
        description="Entra na faixa de vídeos, na parte de baixo da página."
        action={
          <Link
            href="/admin/videos"
            className="inline-flex items-center gap-1.5 rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3.5 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
          >
            <ChevronLeftIcon className="size-5" />
            Voltar para a lista
          </Link>
        }
      />

      <AdminPageBody>
        <PecaForm tipo="videos" anunciantes={listarAnunciantes()} />
      </AdminPageBody>
    </>
  );
}
