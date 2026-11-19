import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminPageBody,
  AdminPageHeader,
} from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  GearIcon,
  ImageIcon,
  LayersIcon,
  MailIcon,
  PixIcon,
  PlayIcon,
  PlusIcon,
  RssIcon,
  SearchIcon,
  StarIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { AD_SPECS } from "@/lib/ads";
import { daysUntil, formatDate } from "@/lib/format";
import {
  contarMensagensNovas,
  listarBanners,
  listarPagamentos,
} from "@/lib/repositorio";


export const metadata: Metadata = { title: "Início" };

const ATALHOS = [
  {
    href: "/admin/banners",
    label: "Banners",
    hint: "As propagandas das faixas",
    Icon: ImageIcon,
  },
  {
    href: "/admin/slides",
    label: "Slides",
    hint: "O carrossel da página inicial",
    Icon: LayersIcon,
  },
  {
    href: "/admin/destaques",
    label: "Destaques",
    hint: "A coluna da esquerda",
    Icon: StarIcon,
  },
  {
    href: "/admin/noticias",
    label: "Notícias",
    hint: "De onde vêm as manchetes",
    Icon: RssIcon,
  },
  {
    href: "/admin/videos",
    label: "Vídeos",
    hint: "A faixa de vídeos da home",
    Icon: PlayIcon,
  },
  {
    href: "/admin/mensagens",
    label: "Mensagens",
    hint: "Recados do formulário",
    Icon: MailIcon,
  },
  {
    href: "/admin/anunciantes",
    label: "Anunciantes",
    hint: "As lojas e seus contatos",
    Icon: UsersIcon,
  },
  {
    href: "/admin/pagamentos",
    label: "Pagamentos",
    hint: "Cobrar por PIX",
    Icon: PixIcon,
  },
  {
    href: "/admin/configuracoes",
    label: "Configurações",
    hint: "Stream, contatos e e-mail",
    Icon: GearIcon,
  },
  {
    href: "/admin/configuracoes#seo-google",
    label: "SEO e Google",
    hint: "Palavras-chave, robots.txt e sitemap",
    Icon: SearchIcon,
  },
];

export default function AdminHomePage() {
  const creatives = listarBanners();
  const payments = listarPagamentos();

  const noAr = creatives.filter((item) => item.status === "no-ar");
  const agendados = creatives.filter((item) => item.status === "agendado");
  const aguardando = payments.filter((item) => item.status === "aguardando");
  const recados = contarMensagensNovas();

  const saindo = noAr
    .map((item) => ({ item, dias: daysUntil(item.endDate) }))
    .filter((linha) => linha.dias >= 0 && linha.dias <= 30)
    .sort((a, b) => a.dias - b.dias);

  const numeros = [
    {
      valor: noAr.length,
      label: "propagandas no ar agora",
      className: "text-success",
    },
    {
      valor: agendados.length,
      label: "agendadas para entrar",
      className: "text-info",
    },
    {
      valor: aguardando.length,
      label: "cobranças esperando pagamento",
      className: "text-warn",
    },
    {
      valor: recados,
      label: "mensagens novas de ouvintes",
      className: "text-info",
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Seu painel"
        description="Aqui você coloca propaganda no ar, escolhe as datas e cobra o anunciante. O visitante do site nunca vê esta parte."
        action={
          <Link
            href="/admin/banners/novo"
            className="inline-flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-gold-400 px-5 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300"
          >
            <PlusIcon className="size-5" />
            Novo banner
          </Link>
        }
      />

      <AdminPageBody>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {numeros.map((numero) => (
            <li
              key={numero.label}
              className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5"
            >
              <p
                className={`font-display text-4xl leading-none ${numero.className}`}
              >
                {numero.valor}
              </p>
              <p className="mt-2 text-sm text-muted">{numero.label}</p>
            </li>
          ))}
        </ul>

        <section className="mt-8 rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised">
          <div className="border-b border-line-soft p-5">
            <h2 className="font-display text-xl text-strong">
              Sai do ar em breve
            </h2>
            <p className="mt-1 text-sm text-muted">
              O sistema tira sozinho na data. Esta lista é só para você saber
              quando falar com o anunciante sobre renovar.
            </p>
          </div>

          {saindo.length > 0 ? (
            <ul className="divide-y divide-line-soft">
              {saindo.map(({ item, dias }) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-strong">
                      {item.advertiserName}
                    </p>
                    <p className="text-sm text-muted">
                      {AD_SPECS[item.slot].label} · sai em{" "}
                      {formatDate(item.endDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap rounded-full bg-gold-100 px-3 py-1 text-sm font-semibold text-gold-700">
                      {dias === 0
                        ? "sai hoje"
                        : dias === 1
                          ? "falta 1 dia"
                          : `faltam ${dias} dias`}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-base text-muted">
              Nenhuma propaganda vence nos próximos 30 dias.
            </p>
          )}
        </section>

        <nav aria-label="Atalhos do painel" className="mt-8">
          <h2 className="font-display text-xl text-strong">O que você quer fazer?</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ATALHOS.map(({ href, label, hint, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-4 rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 transition-colors hover:border-gold-500 hover:bg-gold-50"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-700">
                    <Icon className="size-6" />
                  </span>
                  <span>
                    <span className="block text-base font-semibold text-strong">
                      {label}
                    </span>
                    <span className="block text-sm text-muted">{hint}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </AdminPageBody>
    </>
  );
}
