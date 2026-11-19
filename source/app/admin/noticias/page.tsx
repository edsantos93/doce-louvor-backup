import type { Metadata } from "next";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import { RssSources } from "@/components/admin/RssSources";
import { listarFontes } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Notícias" };

export default function NoticiasAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="Notícias"
        description="A rádio não escreve estas notícias: elas chegam sozinhas dos sites que você cadastrar aqui."
      />

      <AdminPageBody>
        <RssSources sources={listarFontes()} />
      </AdminPageBody>
    </>
  );
}
