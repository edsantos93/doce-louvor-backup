"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useNowPlaying } from "@/components/player/useNowPlaying";
import {
  PauseIcon,
  PlayIcon,
  VolumeIcon,
  VolumeOffIcon,
} from "@/components/ui/icons";

/**
 * Barra fixa do player, presente em todas as páginas.
 * A altura vem de --player-h para que o corpo das páginas reserve o mesmo
 * espaço embaixo e nada fique escondido atrás dela.
 */
interface PlayerBarProps {
  /** Endereço do stream, cadastrado em Configurações. */
  streamUrl: string;
  /** Player pronto da BR Logic, quando o cliente cola o código deles. */
  playerUrl?: string;
}

export function PlayerBar({ streamUrl, playerUrl }: PlayerBarProps) {
  const track = useNowPlaying();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!streamUrl) {
      setAviso(
        "O endereço da transmissão ainda não foi cadastrado no painel.",
      );
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setAviso("Não consegui conectar na transmissão. Confira o endereço.");
    }
  }

  // O player próprio tem preferência porque mostra a capa do disco e o nome
  // da música. O player pronto da BR Logic só entra se não houver o endereço
  // do stream cadastrado.
  if (playerUrl && !streamUrl) {
    return (
      <div
        role="region"
        aria-label="Player da rádio"
        className="fixed inset-x-0 bottom-0 z-40 h-[var(--player-h)] border-t border-line-inverse bg-ink-950 shadow-[var(--shadow-player)] md:h-[var(--player-h-md)]"
      >
        <div className="mx-auto flex h-full max-w-[82rem] items-center px-2 sm:px-4">
          <iframe
            src={playerUrl}
            title="Player da rádio Doce Melodia"
            allow="autoplay"
            scrolling="no"
            className="h-[62px] w-full border-0 bg-transparent"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Player da rádio"
      className="fixed inset-x-0 bottom-0 z-40 h-[var(--player-h)] border-t border-line-inverse bg-ink-950/95 text-on-inverse shadow-[var(--shadow-player)] backdrop-blur md:h-[var(--player-h-md)]"
    >
      {streamUrl ? (
        <audio ref={audioRef} src={streamUrl} preload="none" />
      ) : (
        <audio ref={audioRef} preload="none" />
      )}

      <div className="mx-auto flex h-full max-w-[82rem] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar a rádio" : "Ouvir a rádio ao vivo"}
          aria-pressed={playing}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-400 text-on-brand transition-colors hover:bg-gold-300 md:size-12"
        >
          {playing ? (
            <PauseIcon className="size-5" />
          ) : (
            <PlayIcon className="ml-0.5 size-5" />
          )}
        </button>

        <div className="relative size-11 shrink-0 overflow-hidden rounded-[var(--dm-radius-sm)] bg-ink-900 md:size-12">
          {track.coverUrl ? (
            <Image
              src={track.coverUrl}
              alt={`Capa de ${track.title}, de ${track.artist}`}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <Image
              src="/logo.png"
              alt="Logotipo da Doce Melodia"
              fill
              sizes="48px"
              className="object-contain p-0.5"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.16em] text-live">
              <span className="animate-live size-2 rounded-full bg-live" />
              Ao vivo
            </span>
            {track.program ? (
              <span className="hidden text-2xs text-on-inverse-muted sm:inline">
                {track.program}
              </span>
            ) : null}
          </div>
          <p className="truncate text-sm font-semibold text-cream-50 md:text-base">
            {track.title}
          </p>
          <p className="truncate text-xs text-on-inverse-muted">
            {aviso ?? track.artist}
          </p>
        </div>

        {playing ? (
          <div
            aria-hidden
            className="hidden h-6 items-end gap-0.5 md:flex"
            title="Transmissão em andamento"
          >
            {[0, 1, 2, 3].map((bar) => (
              <span
                key={bar}
                className="animate-eq w-1 rounded-full bg-gold-400"
                style={{
                  height: `${12 + bar * 4}px`,
                  animationDelay: `${bar * 0.16}s`,
                }}
              />
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((current) => !current)}
            aria-label={muted ? "Ativar o som" : "Silenciar o som"}
            aria-pressed={muted}
            className="grid size-10 place-items-center rounded-full text-cream-100 transition-colors hover:bg-ink-900"
          >
            {muted ? (
              <VolumeOffIcon className="size-5" />
            ) : (
              <VolumeIcon className="size-5" />
            )}
          </button>
          <label className="hidden sm:block">
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => {
                setVolume(Number(event.target.value));
                setMuted(false);
              }}
              className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-ink-700 accent-[var(--brand)]"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
