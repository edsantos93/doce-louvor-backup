import type { Advertiser } from "@/lib/types";

export const advertisers: Advertiser[] = [
  {
    id: "anu-01",
    name: "Padaria Pão Quente",
    contactName: "Sebastião Almeida",
    phone: "(11) 98812-4471",
    email: "contato@paoquente.com.br",
    city: "São Paulo, SP",
    since: "2026-08-02",
  },
  {
    id: "anu-02",
    name: "Ótica Visão Clara",
    contactName: "Renata Prado",
    phone: "(11) 99640-2210",
    email: "renata@visaoclara.com.br",
    city: "Guarulhos, SP",
    since: "2026-08-05",
  },
  {
    id: "anu-03",
    name: "Auto Peças do Vale",
    contactName: "Jocimar Ribeiro",
    phone: "(11) 97721-8834",
    email: "vendas@autopecasdovale.com.br",
    city: "São Paulo, SP",
    since: "2026-08-11",
  },
  {
    id: "anu-04",
    name: "Mercado Bom Preço",
    contactName: "Vera Lúcia Dias",
    phone: "(11) 98110-5567",
    email: "vera@mercadobompreco.com.br",
    city: "Osasco, SP",
    since: "2026-08-14",
  },
  {
    id: "anu-05",
    name: "Casa & Cia Móveis",
    contactName: "Adilson Tavares",
    phone: "(11) 99003-7712",
    email: "adilson@casaecia.com.br",
    city: "São Paulo, SP",
    since: "2026-08-19",
  },
  {
    id: "anu-06",
    name: "Salão Beleza Real",
    contactName: "Cristiane Moura",
    phone: "(11) 98455-9021",
    email: "cris@belezareal.com.br",
    city: "Barueri, SP",
    since: "2026-08-22",
  },
];

export function getAdvertiser(id: string): Advertiser | undefined {
  return advertisers.find((advertiser) => advertiser.id === id);
}
