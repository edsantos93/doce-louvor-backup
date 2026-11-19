import type { MetadataRoute } from "next";
import { obterConfig } from "@/lib/configuracoes";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const endereco = obterConfig().siteUrl || site.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // O painel nunca deve ser indexado.
        disallow: ["/admin", "/admin/"],
      },
    ],
    sitemap: `${endereco}/sitemap.xml`,
    host: endereco,
  };
}
