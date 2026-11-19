"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sair } from "@/app/entrar/acoes";
import { useState } from "react";
import {
  CloseIcon,
  ExternalIcon,
  GearIcon,
  HomeIcon,
  ImageIcon,
  LayersIcon,
  MailIcon,
  MenuIcon,
  PixIcon,
  PlayIcon,
  RssIcon,
  StarIcon,
  UsersIcon,
} from "@/components/ui/icons";

const NAV = [
  { href: "/admin", label: "Início", Icon: HomeIcon },
  { href: "/admin/banners", label: "Banners", Icon: ImageIcon },
  { href: "/admin/slides", label: "Slides", Icon: LayersIcon },
  { href: "/admin/destaques", label: "Destaques", Icon: StarIcon },
  { href: "/admin/noticias", label: "Notícias", Icon: RssIcon },
  { href: "/admin/videos", label: "Vídeos", Icon: PlayIcon },
  { href: "/admin/mensagens", label: "Mensagens", Icon: MailIcon },
  { href: "/admin/anunciantes", label: "Anunciantes", Icon: UsersIcon },
  { href: "/admin/pagamentos", label: "Pagamentos", Icon: PixIcon },
  { href: "/admin/configuracoes", label: "Configurações", Icon: GearIcon },
];

function estaAtivo(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

interface AdminShellProps {
  children: React.ReactNode;
  nomeDoUsuario: string;
}

export function AdminShell({ children, nomeDoUsuario }: AdminShellProps) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const itens = NAV.map(({ href, label, Icon }) => {
    const ativo = estaAtivo(pathname, href);
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={ativo ? "page" : undefined}
          onClick={() => setAberto(false)}
          className={`flex items-center gap-3 rounded-[var(--dm-radius-md)] px-4 py-3.5 text-base font-medium transition-colors ${
            ativo
              ? "bg-gold-400 text-on-brand"
              : "text-cream-100 hover:bg-ink-900"
          }`}
        >
          <Icon className="size-5 shrink-0" />
          {label}
        </Link>
      </li>
    );
  });

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      {/* barra do celular */}
      <div className="flex items-center justify-between gap-3 bg-ink-950 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Doce Melodia"
            width={900}
            height={307}
            priority
            className="h-8 w-auto"
          />
          <span className="text-sm font-semibold text-gold-300">Painel</span>
        </Link>
        <button
          type="button"
          onClick={() => setAberto((atual) => !atual)}
          aria-expanded={aberto}
          aria-controls="menu-painel"
          aria-label={aberto ? "Fechar o menu" : "Abrir o menu"}
          className="grid size-11 place-items-center rounded-[var(--dm-radius-sm)] text-cream-100 hover:bg-ink-900"
        >
          {aberto ? (
            <CloseIcon className="size-6" />
          ) : (
            <MenuIcon className="size-6" />
          )}
        </button>
      </div>

      <aside
        id="menu-painel"
        className={`bg-ink-950 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[17rem] lg:shrink-0 lg:flex-col ${
          aberto ? "block" : "hidden lg:block"
        }`}
      >
        <div className="hidden px-5 py-6 lg:block">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Doce Melodia"
              width={900}
              height={307}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <p className="mt-3 text-2xs uppercase tracking-[0.18em] text-gold-400">
            Painel de gerenciamento
          </p>
        </div>

        <nav aria-label="Seções do painel" className="px-3 pb-4 lg:flex-1">
          <ul className="space-y-1">{itens}</ul>
        </nav>

        <div className="border-t border-line-inverse px-5 py-4">
          <p className="text-xs text-on-inverse-muted">Conectado como</p>
          <p className="truncate text-sm font-semibold text-cream-100">
            {nomeDoUsuario}
          </p>

          <form action={sair} className="mt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm font-medium text-gold-300 hover:text-gold-200"
            >
              Sair do painel
            </button>
          </form>

          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cream-200 hover:text-gold-300"
          >
            <ExternalIcon className="size-4" />
            Ver o site
          </a>
        </div>
      </aside>

      <main id="conteudo" className="min-w-0 flex-1 pb-16">
        {children}
      </main>
    </div>
  );
}
