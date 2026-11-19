import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { sessaoAtual } from "@/lib/auth";

// o painel sempre lê do banco na hora, nunca de uma versão guardada
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Painel",
    template: "%s · Painel da Doce Melodia",
  },
  description: "Área de gerenciamento da rádio Doce Melodia.",
  // O painel nunca deve aparecer em buscador.
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const usuario = await sessaoAtual();
  if (!usuario) redirect("/entrar");

  return <AdminShell nomeDoUsuario={usuario.nome}>{children}</AdminShell>;
}
