import type { Metadata } from "next";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import { MessagesList } from "@/components/admin/MessagesList";
import { obterConfig } from "@/lib/configuracoes";
import { listarMensagens } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Mensagens" };

export default function MensagensPage() {
  const config = obterConfig();
  const destino = config.emailDestino || config.email;
  const emailLigado = Boolean(
    config.smtpHost && config.smtpUsuario && config.smtpSenha && destino,
  );

  return (
    <>
      <AdminPageHeader
        title="Mensagens"
        description="Tudo o que o ouvinte manda pelo formulário do site cai aqui — e nada se perde, mesmo se o e-mail falhar."
      />

      <AdminPageBody>
        {!emailLigado ? (
          <p className="mb-6 rounded-[var(--dm-radius-md)] border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-warn">
            O envio por e-mail ainda não está ligado. As mensagens ficam
            guardadas aqui. Para receber também no seu e-mail, preencha os
            dados em Configurações.
          </p>
        ) : (
          <p className="mb-6 rounded-[var(--dm-radius-md)] border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
            As mensagens também são enviadas para {destino}.
          </p>
        )}

        <MessagesList mensagens={listarMensagens()} />
      </AdminPageBody>
    </>
  );
}
