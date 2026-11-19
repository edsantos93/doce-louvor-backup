"use client";

import { CalendarIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";

interface ScheduleFieldsProps {
  start: string;
  end: string;
  onChange: (campo: "start" | "end", valor: string) => void;
  error?: string;
}

const PRESETS = [
  { label: "7 dias", dias: 7 },
  { label: "15 dias", dias: 15 },
  { label: "30 dias", dias: 30 },
  { label: "90 dias", dias: 90 },
];

/** Soma dias a uma data no formato aaaa-mm-dd sem passar por fuso horário. */
function somarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

/** Quantidade de dias no ar, contando o primeiro e o último. */
function diasNoAr(inicio: string, fim: string): number {
  const [a1, m1, d1] = inicio.split("-").map(Number);
  const [a2, m2, d2] = fim.split("-").map(Number);
  return (
    Math.round(
      (Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000,
    ) + 1
  );
}

const campo =
  "w-full rounded-[var(--dm-radius-sm)] border border-line bg-surface-raised px-3.5 py-3.5 text-base text-strong outline-none transition-colors focus:border-gold-500";

/**
 * O coração do cadastro: início e fim da veiculação.
 * A peça entra e sai da grade sozinha nessas datas — é o que evita ter de
 * lembrar de tirar propaganda vencida na mão.
 */
export function ScheduleFields({
  start,
  end,
  onChange,
  error,
}: ScheduleFieldsProps) {
  const duracao = start && end ? diasNoAr(start, end) : 0;
  const valido = Boolean(start && end) && duracao > 0;

  return (
    <fieldset className="rounded-[var(--dm-radius-lg)] border-2 border-gold-300 bg-gold-50 p-5 sm:p-6">
      <legend className="flex items-center gap-2 px-2">
        <CalendarIcon className="size-5 text-gold-700" />
        <span className="font-display text-xl text-strong">
          3. Quando essa propaganda fica no ar?
        </span>
      </legend>

      <p className="mt-1 text-sm text-body">
        O sistema coloca e tira sozinho nas datas escolhidas. Você não precisa
        lembrar de nada depois.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="data-inicio"
            className="mb-1.5 block text-sm font-semibold text-strong"
          >
            Começa a aparecer em
          </label>
          <input
            id="data-inicio"
            type="date"
            value={start}
            onChange={(event) => onChange("start", event.target.value)}
            aria-describedby="resumo-periodo"
            className={campo}
          />
          <p className="mt-1 text-xs text-muted">dia / mês / ano</p>
        </div>

        <div>
          <label
            htmlFor="data-fim"
            className="mb-1.5 block text-sm font-semibold text-strong"
          >
            Sai do ar em
          </label>
          <input
            id="data-fim"
            type="date"
            value={end}
            min={start || undefined}
            onChange={(event) => onChange("end", event.target.value)}
            aria-describedby="resumo-periodo"
            className={campo}
          />
          <p className="mt-1 text-xs text-muted">dia / mês / ano</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Períodos rápidos:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.dias}
            type="button"
            disabled={!start}
            onClick={() => onChange("end", somarDias(start, preset.dias - 1))}
            className="rounded-full border border-gold-500 px-4 py-2 text-sm font-semibold text-gold-700 transition-colors hover:bg-gold-100 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <p
        id="resumo-periodo"
        aria-live="polite"
        className="mt-4 rounded-[var(--dm-radius-sm)] bg-surface-raised px-4 py-3 text-sm text-body"
      >
        {valido ? (
          <>
            Fica{" "}
            <strong className="text-strong">
              {duracao} {duracao === 1 ? "dia" : "dias"}
            </strong>{" "}
            no ar:
            entra em <strong className="text-strong">{formatDate(start)}</strong>{" "}
            e sai sozinha em{" "}
            <strong className="text-strong">{formatDate(end)}</strong>.
          </>
        ) : (
          "Escolha as duas datas para ver quanto tempo a propaganda fica no ar."
        )}
      </p>

      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
