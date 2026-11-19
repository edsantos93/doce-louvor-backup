import { Analytics } from "@/components/layout/Analytics";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { PlayerBar } from "@/components/player/PlayerBar";
import { enderecoDoPlayer, obterConfig } from "@/lib/configuracoes";

/**
 * Moldura do site público: cabeçalho, rodapé, botão de WhatsApp e player.
 * O painel administrativo fica fora deste grupo e não herda nada disso.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const config = obterConfig();

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--dm-radius-sm)] focus:bg-gold-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-on-brand"
      >
        Pular para o conteúdo
      </a>

      <div className="flex min-h-dvh flex-col pb-[var(--player-h)] md:pb-[var(--player-h-md)]">
        <SiteHeader />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>

      <Analytics medicao={config.googleAnalytics} />
      <WhatsAppButton />
      <PlayerBar
        streamUrl={config.streamUrl}
        playerUrl={enderecoDoPlayer(config.playerEmbed)}
      />
    </>
  );
}
