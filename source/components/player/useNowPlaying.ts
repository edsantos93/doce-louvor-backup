"use client";

import { useEffect, useState } from "react";
import type { NowPlaying } from "@/lib/types";

const INICIAL: NowPlaying = {
  title: "Doce Melodia",
  artist: "Ao vivo, 24 horas",
  coverUrl: null,
  program: "",
  listeners: 0,
  isLive: true,
};

/**
 * O que está tocando agora, perguntando de tempos em tempos ao servidor.
 * O servidor lê o dado na BR Logic e busca a capa do disco.
 */
export function useNowPlaying(intervalMs = 20_000): NowPlaying {
  const [faixa, setFaixa] = useState<NowPlaying>(INICIAL);

  useEffect(() => {
    let ativo = true;

    async function buscar() {
      try {
        const resposta = await fetch("/api/tocando", { cache: "no-store" });
        if (!resposta.ok) return;

        const dados = (await resposta.json()) as {
          titulo: string;
          artista: string;
          capa: string | null;
          aoVivo: boolean;
        };

        if (!ativo) return;
        setFaixa({
          title: dados.titulo,
          artist: dados.artista,
          coverUrl: dados.capa,
          program: "",
          listeners: 0,
          isLive: dados.aoVivo,
        });
      } catch {
        // sem internet ou servidor fora: mantém o que já estava na tela
      }
    }

    buscar();
    const timer = window.setInterval(buscar, intervalMs);
    return () => {
      ativo = false;
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return faixa;
}
