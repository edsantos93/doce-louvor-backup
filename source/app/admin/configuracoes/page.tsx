import type { Metadata } from "next";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import { LimparDemo } from "@/components/admin/LimparDemo";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { obterConfig } from "@/lib/configuracoes";
import { contarDemonstracao } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
  return (
    <>
      <AdminPageHeader
        title="Configurações"
        description="Os dados da rádio: endereço do stream, WhatsApp, redes sociais e o que o Google mostra sobre o site."
      />

      <AdminPageBody>
        <SettingsForm config={obterConfig()} />

        <section className="mt-8 rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
          <h2 className="font-display text-xl text-strong">
            Conteúdo de exemplo
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            O site foi entregue com lojas, slides e vídeos inventados, só para
            você ver como fica. Quando tiver o seu próprio conteúdo, apague
            tudo isso de uma vez.
          </p>
          <div className="mt-4">
            <LimparDemo quantidade={contarDemonstracao()} />
          </div>
        </section>
      </AdminPageBody>
    </>
  );
}
