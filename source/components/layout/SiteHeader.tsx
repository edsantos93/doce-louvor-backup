"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CloseIcon, MenuIcon, RadioTowerIcon } from "@/components/ui/icons";
import { mainNav, site } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line-inverse bg-ink-950/95 text-on-inverse backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[82rem] items-center justify-between gap-4 px-4 sm:px-6 md:h-20 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${site.name} — página inicial`}
        >
          <Image
            src="/logo.png"
            alt={`Logotipo da rádio ${site.name}`}
            width={900}
            height={307}
            priority
            className="h-9 w-auto md:h-11"
          />
        </Link>

        <nav aria-label="Menu principal" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative py-2 text-sm font-medium text-cream-100 transition-colors hover:text-gold-300 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold-400 after:transition-transform hover:after:scale-x-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contato"
            className="hidden items-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-4 py-2.5 text-sm font-semibold text-on-brand transition-colors hover:bg-gold-300 sm:inline-flex"
          >
            <RadioTowerIcon className="size-4" />
            Anuncie na rádio
          </Link>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar o menu" : "Abrir o menu"}
            className="grid size-11 place-items-center rounded-[var(--dm-radius-sm)] text-cream-100 transition-colors hover:bg-ink-900 md:hidden"
          >
            {open ? (
              <CloseIcon className="size-6" />
            ) : (
              <MenuIcon className="size-6" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="menu-mobile"
          aria-label="Menu principal"
          className="border-t border-line-inverse bg-ink-950 md:hidden"
        >
          <ul className="mx-auto max-w-[82rem] px-4 py-2 sm:px-6">
            {mainNav.map((item) => (
              <li key={item.href} className="border-b border-line-inverse last:border-b-0">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-base font-medium text-cream-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="py-3">
              <Link
                href="/contato"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-4 py-3 text-base font-semibold text-on-brand"
              >
                <RadioTowerIcon className="size-5" />
                Anuncie na rádio
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
