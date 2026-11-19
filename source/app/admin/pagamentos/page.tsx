import type { Metadata } from "next";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import { PaymentGenerator } from "@/components/admin/PaymentGenerator";
import { PaymentBadge } from "@/components/admin/StatusBadge";
import { formatBRL, formatDate, formatTime } from "@/lib/format";
import { listarAnunciantes, listarPagamentos } from "@/lib/repositorio";

export const metadata: Metadata = { title: "Pagamentos" };

export default function PagamentosPage() {
  const payments = listarPagamentos();

  return (
    <>
      <AdminPageHeader
        title="Pagamentos"
        description="Gere a cobrança por PIX do anunciante e acompanhe quem já pagou."
      />

      <AdminPageBody>
        <PaymentGenerator anunciantes={listarAnunciantes()} />

        <section className="mt-8">
          <h2 className="font-display text-xl text-strong">
            Cobranças já enviadas
          </h2>

          {/* celular */}
          <ul className="mt-4 space-y-3 md:hidden">
            {payments.map((pagamento) => (
              <li
                key={pagamento.id}
                className="rounded-[var(--dm-radius-md)] border border-line bg-surface-raised p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-strong">
                      {pagamento.advertiserName}
                    </p>
                    <p className="text-sm text-muted">
                      {pagamento.description}
                    </p>
                  </div>
                  <PaymentBadge status={pagamento.status} />
                </div>
                <p className="mt-3 border-t border-line-soft pt-3 text-sm text-body">
                  {formatBRL(pagamento.valueCents)} · enviada em{" "}
                  {formatDate(pagamento.createdAt)}
                  {pagamento.paidAt
                    ? ` · paga às ${formatTime(pagamento.paidAt)}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>

          {/* computador */}
          <div className="mt-4 hidden overflow-x-auto rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Histórico de cobranças por PIX, com anunciante, valor, datas e
                situação do pagamento.
              </caption>
              <thead>
                <tr className="border-b border-line-soft bg-surface-sunken text-xs uppercase tracking-[0.1em] text-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Anunciante
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Referente a
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Valor
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Enviada em
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Paga em
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Situação
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pagamento) => (
                  <tr
                    key={pagamento.id}
                    className="border-b border-line-soft last:border-b-0 hover:bg-surface-sunken"
                  >
                    <td className="px-4 py-3 font-semibold text-strong">
                      {pagamento.advertiserName}
                    </td>
                    <td className="px-4 py-3 text-sm text-body">
                      {pagamento.description}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-strong">
                      {formatBRL(pagamento.valueCents)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-body">
                      {formatDate(pagamento.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-body">
                      {pagamento.paidAt ? formatDate(pagamento.paidAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={pagamento.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </AdminPageBody>
    </>
  );
}
