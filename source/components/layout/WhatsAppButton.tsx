import { WhatsAppIcon } from "@/components/ui/icons";
import { obterConfig, whatsappLimpo } from "@/lib/configuracoes";
import { site } from "@/lib/site";

/**
 * Botão flutuante do WhatsApp.
 * Fica sempre acima da barra do player: a posição é calculada a partir da
 * mesma variável de altura, então os dois nunca se sobrepõem.
 */
export function WhatsAppButton() {
  const config = obterConfig();
  const numero = whatsappLimpo(config.whatsapp);

  // sem número cadastrado o botão não aparece, para ninguém clicar à toa
  if (!numero) return null;

  const href = `https://wa.me/${numero}?text=${encodeURIComponent(
    config.whatsappMensagem || site.whatsappMessage,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Falar com a Doce Melodia no WhatsApp"
      className="fixed right-4 bottom-[calc(var(--player-h)+0.75rem)] z-30 grid size-14 place-items-center rounded-full bg-[var(--dm-whatsapp)] text-white shadow-[var(--shadow-lift)] transition-transform hover:scale-105 md:right-6 md:bottom-[calc(var(--player-h-md)+1rem)]"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
