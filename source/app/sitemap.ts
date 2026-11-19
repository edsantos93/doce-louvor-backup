import type { MetadataRoute } from "next";
import { obterConfig } from "@/lib/configuracoes";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const endereco = obterConfig().siteUrl || site.url;

  return [
    {
      url: endereco,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${endereco}/contato`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
