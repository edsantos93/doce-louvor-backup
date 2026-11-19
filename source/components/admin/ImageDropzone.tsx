"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { TrashIcon, UploadIcon } from "@/components/ui/icons";

interface ImageDropzoneProps {
  /** Endereço da pré-visualização atual (blob ou arquivo já salvo). */
  value: string | null;
  onChange: (previewUrl: string | null, file: File | null) => void;
  /** Medida sugerida, mostrada em português comum. */
  recommended: string;
  error?: string;
}

/**
 * Área de envio da arte: arrasta o arquivo para dentro (ou clica) e a imagem
 * aparece na hora, do jeito que vai ficar no site.
 */
export function ImageDropzone({
  value,
  onChange,
  recommended,
  error,
}: ImageDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const urlAnterior = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlAnterior.current) URL.revokeObjectURL(urlAnterior.current);
    };
  }, []);

  function receber(arquivo: File | undefined) {
    if (!arquivo || !arquivo.type.startsWith("image/")) return;

    if (urlAnterior.current) URL.revokeObjectURL(urlAnterior.current);
    const url = URL.createObjectURL(arquivo);
    urlAnterior.current = url;
    setNomeArquivo(arquivo.name);
    onChange(url, arquivo);
  }

  function limpar() {
    if (urlAnterior.current) URL.revokeObjectURL(urlAnterior.current);
    urlAnterior.current = null;
    setNomeArquivo(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange(null, null);
  }

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-describedby={`${inputId}-dica`}
        aria-invalid={Boolean(error)}
        onChange={(event) => receber(event.target.files?.[0])}
      />

      {value ? (
        <div className="overflow-hidden rounded-[var(--dm-radius-md)] border border-line bg-surface-sunken">
          <div className="relative aspect-[970/240] w-full bg-ink-900">
            <Image
              src={value}
              alt="Prévia da arte enviada"
              fill
              unoptimized
              sizes="(min-width: 1024px) 520px, 92vw"
              className="object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <p className="min-w-0 truncate text-sm text-muted">
              {nomeArquivo ?? "Arte atual"}
            </p>
            <div className="flex gap-2">
              <label
                htmlFor={inputId}
                className="cursor-pointer rounded-[var(--dm-radius-sm)] border border-line-strong px-4 py-2.5 text-sm font-semibold text-strong transition-colors hover:bg-surface-raised"
              >
                Trocar imagem
              </label>
              <button
                type="button"
                onClick={limpar}
                className="inline-flex items-center gap-1.5 rounded-[var(--dm-radius-sm)] border border-line-strong px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft"
              >
                <TrashIcon className="size-4" />
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(event) => {
            event.preventDefault();
            setArrastando(false);
            receber(event.dataTransfer.files?.[0]);
          }}
          className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--dm-radius-md)] border-2 border-dashed p-6 text-center transition-colors ${
            arrastando
              ? "border-gold-500 bg-gold-50"
              : error
                ? "border-danger bg-danger-soft/40"
                : "border-line-strong bg-surface-sunken hover:border-gold-500 hover:bg-gold-50"
          }`}
        >
          <span className="grid size-12 place-items-center rounded-full bg-gold-100 text-gold-700">
            <UploadIcon className="size-6" />
          </span>
          <span className="text-base font-semibold text-strong">
            Arraste a imagem para cá
          </span>
          <span className="text-sm text-muted">
            ou clique para escolher no computador
          </span>
        </label>
      )}

      <p id={`${inputId}-dica`} className="mt-2 text-xs text-muted">
        Tamanho recomendado: {recommended}. Formatos aceitos: JPG, PNG ou WebP.
      </p>

      {error ? (
        <p role="alert" className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
