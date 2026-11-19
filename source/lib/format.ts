import { MOCK_NOW } from "@/lib/site";

const TZ = "America/Sao_Paulo";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateShort = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TZ,
});

const dateLong = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

const timeShort = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

/** 12345 → "R$ 123,45" */
export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

const SOMENTE_DATA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * "2026-08-27" → "27/08/2026".
 * Datas sem hora são formatadas na mão: convertê-las para Date faria o dia
 * "voltar" um, porque o navegador as lê como meia-noite em UTC.
 */
export function formatDate(iso: string | Date): string {
  if (typeof iso === "string" && SOMENTE_DATA.test(iso)) {
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  return dateShort.format(new Date(iso));
}

/** "2026-08-27" → "27 de agosto de 2026" */
export function formatDateLong(iso: string | Date): string {
  return dateLong.format(new Date(iso));
}

/** "2026-08-27T18:00" → "18:00" */
export function formatTime(iso: string | Date): string {
  return timeShort.format(new Date(iso));
}

/** Período contratado, como aparece no painel: "01/09 a 30/09/2026". */
export function formatPeriod(startIso: string, endIso: string): string {
  return `${formatDate(startIso)} a ${formatDate(endIso)}`;
}

/**
 * Rótulo relativo em português: "agora", "há 12 min", "há 3 h", "há 2 dias".
 * Calculado a partir de MOCK_NOW para não divergir entre servidor e cliente.
 */
export function formatRelative(
  iso: string | Date,
  from: Date = MOCK_NOW,
): string {
  const diffMinutes = Math.round(
    (from.getTime() - new Date(iso).getTime()) / 60000,
  );

  if (diffMinutes < 2) return "agora";
  if (diffMinutes < 60) return `há ${diffMinutes} min`;

  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.round(hours / 24);
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;

  const months = Math.round(days / 30);
  return months === 1 ? "há 1 mês" : `há ${months} meses`;
}

/**
 * Dias que faltam para a peça sair do ar (negativo = já saiu).
 * Conta a partir de hoje de verdade — quem usa MOCK_NOW é só o conteúdo
 * de demonstração das notícias.
 */
export function daysUntil(iso: string, from: Date = new Date()): number {
  const ms = new Date(iso).getTime() - from.getTime();
  return Math.ceil(ms / 86_400_000);
}

/** 1234 → "1.234" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}
