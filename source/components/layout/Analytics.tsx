import Script from "next/script";

interface AnalyticsProps {
  /** Medição do Google Analytics (G-XXXXXXXXXX). Vazio: não carrega nada. */
  medicao: string;
}

/**
 * Google Analytics.
 * Só entra na página quando o cliente cadastra a medição no painel — sem
 * isso, nenhum script de fora é carregado e o site continua leve.
 */
export function Analytics({ medicao }: AnalyticsProps) {
  if (!/^G-[A-Z0-9]{4,}$/i.test(medicao)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${medicao}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${medicao}');`}
      </Script>
    </>
  );
}
