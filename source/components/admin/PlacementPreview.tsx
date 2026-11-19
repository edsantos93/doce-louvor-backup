import Image from "next/image";
import { AD_SPECS } from "@/lib/ads";
import type { AdSlotId } from "@/lib/types";

interface PlacementPreviewProps {
  slot: AdSlotId | "";
  /** Miniatura da arte enviada, quando já existe. */
  previewUrl?: string | null;
}

interface BlocoProps {
  id: AdSlotId;
  slot: AdSlotId | "";
  previewUrl?: string | null;
  className?: string;
}

function Bloco({ id, slot, previewUrl, className = "" }: BlocoProps) {
  const ativo = id === slot;

  return (
    <div
      className={`relative overflow-hidden rounded-[3px] ${
        ativo
          ? "bg-gold-400 outline outline-2 outline-offset-1 outline-gold-700"
          : "bg-cream-300"
      } ${className}`}
    >
      {ativo && previewUrl ? (
        <Image
          src={previewUrl}
          alt=""
          fill
          unoptimized
          sizes="160px"
          className="object-cover"
        />
      ) : null}
    </div>
  );
}

/** Linha cinza representando texto do site. */
function Linhas({
  quantidade,
  className = "",
}: {
  quantidade: number;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {Array.from({ length: quantidade }, (_, indice) => (
        <div
          key={indice}
          className="h-1.5 rounded-full bg-cream-200"
          style={{ width: `${100 - (indice % 3) * 12}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Mapa da página com o lugar escolhido pintado de dourado:
 * banner no topo, AdSense no meio, banner no rodapé, destaques à esquerda,
 * notícias à direita e a faixa de vídeos embaixo.
 */
export function PlacementPreview({ slot, previewUrl }: PlacementPreviewProps) {
  const nome = slot ? AD_SPECS[slot].label : null;

  return (
    <div>
      <div
        aria-hidden
        className="space-y-2 rounded-[var(--dm-radius-md)] border border-line bg-surface-raised p-3"
      >
        {/* cabeçalho do site */}
        <div className="h-4 rounded-[3px] bg-ink-800" />

        {/* faixa do topo: banner rotativo */}
        <Bloco
          id="topo-banner"
          slot={slot}
          previewUrl={previewUrl}
          className="h-7"
        />

        <Linhas quantidade={2} />

        {/* miolo em três colunas */}
        <div className="grid grid-cols-[3fr_6fr_3fr] gap-1.5">
          <div className="space-y-1.5">
            <div className="h-6 rounded-[3px] bg-cream-200" />
            <Bloco
              id="destaque-1"
              slot={slot}
              previewUrl={previewUrl}
              className="h-7"
            />
            <div className="h-6 rounded-[3px] bg-cream-200" />
            <Bloco
              id="destaque-2"
              slot={slot}
              previewUrl={previewUrl}
              className="h-7"
            />
          </div>

          <div className="space-y-1.5">
            <div className="h-12 rounded-[3px] bg-ink-700" />
            <Linhas quantidade={3} />
            <Bloco
              id="feed-inline"
              slot={slot}
              previewUrl={previewUrl}
              className="h-4"
            />
            <Linhas quantidade={3} />
          </div>

          {/* notícias: foto em cima, manchete embaixo */}
          <div className="space-y-1.5">
            {[0, 1, 2].map((indice) => (
              <div key={indice} className="space-y-1">
                <div className="h-5 rounded-[3px] bg-cream-200" />
                <div className="h-1.5 w-4/5 rounded-full bg-cream-200" />
              </div>
            ))}
          </div>
        </div>

        {/* faixa do meio: AdSense */}
        <Bloco
          id="meio-adsense"
          slot={slot}
          previewUrl={previewUrl}
          className="h-7"
        />

        <Linhas quantidade={2} />

        {/* faixa de vídeos */}
        <div className="grid grid-cols-6 gap-1">
          {[0, 1, 2, 3, 4, 5].map((indice) => (
            <div key={indice} className="h-4 rounded-[3px] bg-cream-200" />
          ))}
        </div>

        {/* faixa do rodapé: banner rotativo */}
        <Bloco
          id="rodape-banner"
          slot={slot}
          previewUrl={previewUrl}
          className="h-7"
        />

        <div className="h-5 rounded-[3px] bg-ink-800" />
      </div>

      <p aria-live="polite" className="mt-3 text-sm text-body">
        {nome ? (
          <>
            A parte dourada é o lugar da sua propaganda:{" "}
            <strong className="text-strong">{nome}</strong>.
          </>
        ) : (
          "Escolha a posição para ver, aqui em cima, onde a propaganda vai aparecer."
        )}
      </p>
    </div>
  );
}
