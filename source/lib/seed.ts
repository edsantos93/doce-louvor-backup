import type Database from "better-sqlite3";
import { creatives } from "@/lib/mock/ads";
import { advertisers } from "@/lib/mock/advertisers";
import { destaques } from "@/lib/mock/destaques";
import { rssSources, videos } from "@/lib/mock/noticias";
import { payments } from "@/lib/mock/pagamentos";
import { slides } from "@/lib/mock/slides";

/**
 * Conteúdo inicial: só entra quando o banco está vazio, na primeira vez que
 * o site sobe. Serve para a rádio não começar com a página em branco — o
 * cliente vai trocando por conteúdo de verdade pelo painel.
 */
export function semear(banco: Database.Database) {
  const agora = new Date().toISOString();

  const inserirAnunciante = banco.prepare(
    `INSERT OR IGNORE INTO anunciantes (id, nome, contato, telefone, email, cidade, desde)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const inserirBanner = banco.prepare(
    `INSERT OR IGNORE INTO banners (id, anunciante_id, slot, imagem, alt, href, inicio, fim, valor_centavos, pago, ordem, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const inserirSlide = banco.prepare(
    `INSERT OR IGNORE INTO slides (id, kicker, titulo, subtitulo, imagem, alt, href, inicio, fim, ordem)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const inserirDestaque = banco.prepare(
    `INSERT OR IGNORE INTO destaques (id, tipo, anunciante_id, titulo, resumo, imagem, alt, href, inicio, fim, ordem)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const inserirVideo = banco.prepare(
    `INSERT OR IGNORE INTO videos (id, titulo, thumb, alt, href, duracao, publicado_em, ordem)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const inserirFonte = banco.prepare(
    `INSERT OR IGNORE INTO fontes_rss (id, nome, url, categoria, ativo, ultima_sync, itens)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const inserirPagamento = banco.prepare(
    `INSERT OR IGNORE INTO pagamentos (id, anunciante_id, descricao, valor_centavos, status, criado_em, pago_em, pix_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const tudo = banco.transaction(() => {
    // conferido dentro da transação: em produção o build sobe vários
    // processos ao mesmo tempo e todos abrem o banco juntos
    const jaTem = banco
      .prepare("SELECT COUNT(*) AS total FROM anunciantes")
      .get() as { total: number };
    if (jaTem.total > 0) return;

    for (const item of advertisers) {
      inserirAnunciante.run(
        item.id,
        item.name,
        item.contactName,
        item.phone,
        item.email,
        item.city,
        item.since,
      );
    }

    for (const item of creatives) {
      inserirBanner.run(
        item.id,
        item.advertiserId,
        item.slot,
        item.imageUrl,
        item.alt,
        item.href,
        item.startDate,
        item.endDate,
        item.priceCents,
        item.status === "aguardando-pagamento" ? 0 : 1,
        0,
        agora,
      );
    }

    for (const item of slides) {
      inserirSlide.run(
        item.id,
        item.kicker,
        item.title,
        item.subtitle,
        item.imageUrl,
        item.alt,
        item.href,
        item.startDate,
        item.endDate,
        item.order,
      );
    }

    for (const item of destaques) {
      const anunciante = advertisers.find(
        (linha) => linha.name === item.advertiserName,
      );
      inserirDestaque.run(
        item.id,
        item.kind,
        anunciante?.id ?? null,
        item.title,
        item.excerpt,
        item.imageUrl,
        item.alt,
        item.href,
        item.startDate,
        item.endDate,
        item.order,
      );
    }

    for (const [posicao, item] of videos.entries()) {
      inserirVideo.run(
        item.id,
        item.title,
        item.thumbUrl,
        item.alt,
        item.href,
        item.duration,
        item.publishedAt,
        posicao,
      );
    }

    for (const item of rssSources) {
      inserirFonte.run(
        item.id,
        item.name,
        item.url,
        item.category,
        item.active ? 1 : 0,
        item.lastSyncAt,
        item.itemCount,
      );
    }

    for (const item of payments) {
      inserirPagamento.run(
        item.id,
        item.advertiserId,
        item.description,
        item.valueCents,
        item.status,
        item.createdAt,
        item.paidAt,
        item.pixCode,
      );
    }
  });

  tudo.immediate();
}

/**
 * Bancos criados antes tinham sites de notícia de exemplo, que não existem
 * de verdade. Troca por fontes reais uma única vez.
 */
export function trocarFontesDeExemplo(banco: Database.Database) {
  const exemplo = banco
    .prepare(
      "SELECT COUNT(*) AS total FROM fontes_rss WHERE url LIKE '%exemplo.com.br%'",
    )
    .get() as { total: number };

  if (exemplo.total === 0) return;

  const inserir = banco.prepare(
    `INSERT OR IGNORE INTO fontes_rss (id, nome, url, categoria, ativo, ultima_sync, itens)
     VALUES (?, ?, ?, ?, 1, NULL, 0)`,
  );

  const trocar = banco.transaction(() => {
    banco
      .prepare("DELETE FROM fontes_rss WHERE url LIKE '%exemplo.com.br%'")
      .run();
    for (const fonte of rssSources) {
      inserir.run(fonte.id, fonte.name, fonte.url, fonte.category);
    }
  });

  trocar.immediate();
}
