"use client";

import { useEffect, useRef } from "react";
import { AlertIcon } from "@/components/ui/icons";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** O que vai acontecer, escrito de forma direta. */
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmação antes de apagar qualquer coisa.
 * Usa o <dialog> do próprio navegador: prende o foco e fecha no Esc.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Sim, apagar",
  cancelLabel = "Não, voltar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
      aria-labelledby="titulo-confirmacao"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-0 text-body shadow-[var(--shadow-lift)] backdrop:bg-ink-950/60"
    >
      <div className="p-6">
        <div className="flex gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-danger-soft text-danger">
            <AlertIcon className="size-6" />
          </span>
          <div>
            <h2
              id="titulo-confirmacao"
              className="font-display text-xl text-strong"
            >
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-muted">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-[var(--dm-radius-sm)] bg-danger px-5 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
