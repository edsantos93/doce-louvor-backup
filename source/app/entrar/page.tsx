import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { contarUsuarios, sessaoAtual } from "@/lib/auth";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function EntrarPage() {
  if (await sessaoAtual()) redirect("/admin");

  const primeiroAcesso = contarUsuarios() === 0;

  return (
    <main className="grid min-h-dvh place-items-center bg-ink-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Image
            src="/logo.png"
            alt={`Logotipo da rádio ${site.name}`}
            width={900}
            height={307}
            priority
            className="mx-auto h-12 w-auto"
          />
        </div>

        <div className="rounded-[var(--dm-radius-lg)] bg-surface-raised p-6 shadow-[var(--shadow-lift)] sm:p-8">
          <h1 className="font-display text-2xl text-strong">
            {primeiroAcesso ? "Criar seu acesso" : "Entrar no painel"}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {primeiroAcesso
              ? "Este é o primeiro acesso: escolha o e-mail e a senha que você vai usar para gerenciar o site."
              : "Área de gerenciamento da rádio. Só você entra aqui."}
          </p>

          <div className="mt-6">
            <LoginForm primeiroAcesso={primeiroAcesso} />
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-on-inverse-muted">
          <Link href="/" className="hover:text-gold-300">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </main>
  );
}
