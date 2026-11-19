import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";
import { MailIcon, RadioTowerIcon, WhatsAppIcon } from "@/components/ui/icons";
import { obterConfig, whatsappLimpo } from "@/lib/configuracoes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a Doce Melodia: peça sua música, mande um recado para o locutor ou anuncie sua loja na rádio.",
  alternates: { canonical: "/contato" },
  openGraph: {
    title: `Contato · ${site.name}`,
    description:
      "Fale com a Doce Melodia: peça sua música, mande um recado ou anuncie sua loja.",
    url: `${site.url}/contato`,
  },
};

export default function ContatoPage() {
  const config = obterConfig();
  const whats = whatsappLimpo(config.whatsapp);

  return (
    <>
      <section className="border-b border-line-inverse bg-ink-950 py-10 text-on-inverse md:py-14">
        <Container narrow>
          <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-gold-400">
            Fale com a rádio
          </p>
          <h1 className="mt-2 font-display text-4xl text-cream-50">
            A gente lê tudo o que chega
          </h1>
          <p className="mt-3 max-w-xl text-base text-cream-200">
            Pedido de música, recado para quem você ama ou proposta de anúncio
            para a sua loja: escolha o assunto e escreva. Respondemos rápido.
          </p>
        </Container>
      </section>

      <Container narrow className="py-10 md:py-14">
        <ContactForm />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {whats ? (
            <a
              href={`https://wa.me/${whats}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 rounded-[var(--dm-radius-md)] border border-line bg-surface-raised p-4 transition-colors hover:border-gold-500"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--dm-whatsapp)] text-white">
                <WhatsAppIcon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-strong">
                  WhatsApp
                </span>
                <span className="block text-xs text-muted">
                  Resposta na hora
                </span>
              </span>
            </a>
          ) : null}

          <a
            href={`mailto:${config.email}`}
            className="flex items-center gap-3 rounded-[var(--dm-radius-md)] border border-line bg-surface-raised p-4 transition-colors hover:border-gold-500"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-700">
              <MailIcon className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-strong">
                E-mail
              </span>
              <span className="block truncate text-xs text-muted">
                {config.email}
              </span>
            </span>
          </a>

          <div className="flex items-center gap-3 rounded-[var(--dm-radius-md)] border border-line bg-surface-raised p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-700">
              <RadioTowerIcon className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-strong">
                Anunciar
              </span>
              <span className="block text-xs text-muted">
                Planos por período
              </span>
            </span>
          </div>
        </div>
      </Container>
    </>
  );
}
