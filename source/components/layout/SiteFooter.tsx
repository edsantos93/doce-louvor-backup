import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MailIcon, WhatsAppIcon } from "@/components/ui/icons";
import { obterConfig, whatsappLimpo } from "@/lib/configuracoes";
import { mainNav, site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const config = obterConfig();
  const whats = whatsappLimpo(config.whatsapp);

  return (
    <footer className="bg-ink-950 pt-12 text-on-inverse">
      <Container>
        <div className="grid gap-10 pb-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Image
              src="/logo.png"
              alt={`Logotipo da rádio ${config.nomeDaRadio}`}
              width={900}
              height={307}
              className="h-12 w-auto"
            />
            <p className="mt-4 max-w-sm text-sm text-on-inverse-muted">
              {site.description}
            </p>
            <p className="mt-4 text-sm text-on-inverse-muted">
              Transmissão 24 horas pela internet.
            </p>
          </div>

          <nav aria-label="Rodapé">
            <h2 className="font-display text-lg text-gold-300">Navegue</h2>
            <ul className="mt-3 space-y-2">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-200 hover:text-gold-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-lg text-gold-300">Fale conosco</h2>
            <ul className="mt-3 space-y-3">
              {whats ? (
                <li>
                  <a
                    href={`https://wa.me/${whats}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 text-sm text-cream-200 hover:text-gold-300"
                  >
                    <WhatsAppIcon className="size-4" />
                    WhatsApp da rádio
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  href={`mailto:${config.email}`}
                  className="inline-flex items-center gap-2 text-sm text-cream-200 hover:text-gold-300"
                >
                  <MailIcon className="size-4" />
                  {config.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line-inverse py-6 text-xs text-on-inverse-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {config.nomeDaRadio}. Todos os direitos reservados.
          </p>
          <p>{site.slogan}</p>
        </div>
      </Container>
    </footer>
  );
}
