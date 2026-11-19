import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import { PecaForm } from "@/components/admin/PecaForm";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { listarAnunciantes } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Novo slide" };

export default function NovoSlidesPage() {
  return (
    <>
      <AdminPageHeader
        title="Novo slide"
        description="A tela grande que passa sozinha no alto da página inicial."
        action={
          <Link
            href="/admin/slides"
            className="inline-flex items-center gap-1.5 rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3.5 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
          >
            <ChevronLeftIcon className="size-5" />
            Voltar para a lista
          </Link>
        }
      />

      <AdminPageBody>
        <PecaForm tipo="slides" anunciantes={listarAnunciantes()} />
      </AdminPageBody>
    </>
  );
}
