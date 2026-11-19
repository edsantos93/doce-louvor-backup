"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { conferirEmail, salvarConfiguracoes } from "@/app/admin/acoes";
import { AlertIcon, CheckIcon, ExternalIcon } from "@/components/ui/icons";
import type { Configuracoes } from "@/lib/configuracoes";

interface SettingsFormProps {
  config: Configuracoes;
}

const campo =
  "w-full rounded-[var(--dm-radius-sm)] border border-line bg-surface-raised px-3.5 py-3.5 text-base text-strong outline-none transition-colors focus:border-gold-500";

interface CampoProps {
  id: keyof Configuracoes;
  label: string;
  hint?: string;
  valor: string;
  tipo?: string;
  placeholder?: string;
  largo?: boolean;
  linhas?: number;
}

export function SettingsForm({ config }: SettingsFormProps) {
  const router = useRouter();
  const [salvando, iniciar] = useTransition();
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [testeEmail, setTesteEmail] = useState<string | null>(null);
  const [testando, iniciarTeste] = useTransition();

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);

    iniciar(async () => {
      const resposta = await salvarConfiguracoes(dados);
      if (resposta.ok) {
        setSalvo(true);
        setErro(null);
        router.refresh();
        window.setTimeout(() => setSalvo(false), 4000);
      } else {
        setErro(resposta.erro ?? "Não consegui salvar.");
      }
    });
  }

  function Campo({
    id,
    label,
    hint,
    valor,
    tipo = "text",
    placeholder,
    largo,
    linhas,
  }: CampoProps) {
    return (
      <div className={largo ? "sm:col-span-2" : ""}>
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-semibold text-strong"
        >
          {label}
        </label>
        {linhas ? (
          <textarea
            id={id}
            name={id}
            rows={linhas}
            defaultValue={valor}
            placeholder={placeholder}
            className={`${campo} resize-y`}
          />
        ) : (
          <input
            id={id}
            name={id}
            type={tipo}
            defaultValue={valor}
            placeholder={placeholder}
            className={campo}
          />
        )}
        {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-6">
      <section
        id="seo-google"
        className="scroll-mt-6 rounded-[var(--dm-radius-lg)] border-2 border-gold-300 bg-gold-50 p-5 sm:p-6"
      >
        <h2 id="seo" className="font-display text-xl text-strong">
          1. SEO — como o site aparece no Google
        </h2>
        <p className="mt-1 text-sm text-body">
          É isso que o Google mostra na lista de resultados quando alguém
          procura pela rádio.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo
            id="seoTitulo"
            label="Título do site"
            valor={config.seoTitulo}
            largo
            hint="Aparece como o link azul no Google. Até 60 caracteres."
          />
          <Campo
            id="seoDescricao"
            label="Descrição"
            valor={config.seoDescricao}
            largo
            linhas={3}
            hint="O textinho cinza embaixo do título, no Google. Até 160 caracteres."
          />
          <Campo
            id="seoPalavras"
            label="Palavras-chave (hashtags)"
            valor={config.seoPalavras}
            largo
            linhas={2}
            hint="Separe por vírgula: rádio online, sertanejo, notícias da região…"
          />
        </div>

        <div className="mt-4">
          <Campo
            id="googleVerificacao"
            label="Código de verificação do Google"
            valor={config.googleVerificacao}
            largo
            placeholder="Cole aqui o código que o Google Search Console mostrar"
            hint="Serve para provar ao Google que o site é seu e pedir que ele indexe as páginas. É a etapa que faz a rádio aparecer na busca."
          />
        </div>

        <div className="mt-4">
          <Campo
            id="googleAnalytics"
            label="Google Analytics"
            valor={config.googleAnalytics}
            largo
            placeholder="G-XXXXXXXXXX"
            hint="Mostra quantas pessoas entram no site, de onde vêm e o que mais acessam. Cole aqui o código de medição que o Google Analytics te dá."
          />
        </div>

        <div className="mt-5 rounded-[var(--dm-radius-md)] bg-surface-raised p-4">
          <p className="text-sm font-semibold text-strong">
            Arquivos que o Google lê no seu site
          </p>
          <p className="mt-1 text-xs text-muted">
            São gerados sozinhos e ficam sempre atualizados. Clique para
            conferir.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-strong hover:bg-surface-sunken"
            >
              <ExternalIcon className="size-4" />
              robots.txt
            </a>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-strong hover:bg-surface-sunken"
            >
              <ExternalIcon className="size-4" />
              sitemap.xml
            </a>
          </div>
        </div>
      </section>


      <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
        <h2 className="font-display text-xl text-strong">
          2. Identidade da rádio
        </h2>
        <p className="mt-1 text-sm text-muted">
          Trocou o nome ou o endereço da rádio? É aqui. O site inteiro e o
          Google passam a usar o que estiver escrito nestes dois campos.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo
            id="nomeDaRadio"
            label="Nome da rádio"
            valor={config.nomeDaRadio}
            placeholder="Doce Louvor"
          />
          <Campo
            id="siteUrl"
            label="Endereço oficial do site"
            valor={config.siteUrl}
            placeholder="https://docelouvor.net"
            hint="Com https e sem barra no final."
          />
        </div>
      </section>

      <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
        <h2 className="font-display text-xl text-strong">3. A rádio no ar</h2>
        <p className="mt-1 text-sm text-muted">
          É o endereço que o player toca. Você encontra ele no painel da BR
          Logic, na parte de streaming.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo
            id="playerEmbed"
            label="Código do player da BR Logic"
            valor={config.playerEmbed}
            largo
            linhas={3}
            placeholder='<iframe src="https://..." ...></iframe>'
            hint="Cole aqui o código que a BR Logic entrega. É o jeito mais simples: o player deles aparece na barra de baixo do site."
          />
          <Campo
            id="streamUrl"
            label="Endereço direto do stream"
            valor={config.streamUrl}
            largo
            placeholder="https://servidor.brlogic.com:8000/live"
            hint="Com este endereço preenchido, o site usa o player próprio, que mostra a capa do disco e o nome da música. Deixando vazio, entra o player pronto da BR Logic."
          />
        </div>
      </section>

      <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
        <h2 className="font-display text-xl text-strong">4. Contatos</h2>
        <p className="mt-1 text-sm text-muted">
          O WhatsApp aqui é o do botão verde que fica flutuando no site.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo
            id="whatsapp"
            label="WhatsApp da rádio"
            valor={config.whatsapp}
            placeholder="(11) 98812-4471"
            hint="Com DDD. Pode escrever com parênteses e traço."
          />
          <Campo
            id="email"
            label="E-mail de contato"
            valor={config.email}
            tipo="email"
            placeholder="contato@docemelodia.net"
          />
          <Campo
            id="whatsappMensagem"
            label="Mensagem que já vem escrita"
            valor={config.whatsappMensagem}
            largo
            hint="O ouvinte abre o WhatsApp com essa frase pronta."
          />
          <Campo
            id="instagram"
            label="Instagram"
            valor={config.instagram}
            placeholder="https://instagram.com/suaradio"
          />
          <Campo
            id="facebook"
            label="Facebook"
            valor={config.facebook}
            placeholder="https://facebook.com/suaradio"
          />
          <Campo
            id="youtube"
            label="YouTube"
            valor={config.youtube}
            placeholder="https://youtube.com/@suaradio"
            largo
          />
        </div>
      </section>

      <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
        <h2 id="email" className="scroll-mt-6 font-display text-xl text-strong">
          5. Mensagens do site no seu e-mail
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tudo o que chega pelo formulário fica guardado na tela de Mensagens.
          Preenchendo aqui, você também recebe cada recado no seu e-mail.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo
            id="emailDestino"
            label="Receber as mensagens em"
            valor={config.emailDestino}
            largo
            tipo="email"
            placeholder="comercial@docemelodia.net"
          />
          <Campo
            id="smtpHost"
            label="Servidor de e-mail"
            valor={config.smtpHost}
            hint="Na Hostinger é smtp.hostinger.com"
          />
          <Campo
            id="smtpPorta"
            label="Porta"
            valor={config.smtpPorta}
            hint="465 para conexão segura"
          />
          <Campo
            id="smtpUsuario"
            label="E-mail que envia"
            valor={config.smtpUsuario}
            tipo="email"
            placeholder="comercial@docemelodia.net"
          />
          <Campo
            id="smtpSenha"
            label="Senha desse e-mail"
            valor={config.smtpSenha}
            tipo="password"
            hint="É a senha da caixa de e-mail, criada na Hostinger."
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line-soft pt-4">
          <button
            type="button"
            disabled={testando}
            onClick={() =>
              iniciarTeste(async () => {
                setTesteEmail(null);
                const resposta = await conferirEmail();
                setTesteEmail(
                  resposta.ok
                    ? "Conectou certinho. O envio está ligado."
                    : `Não conectou: ${resposta.erro}`,
                );
              })
            }
            className="rounded-[var(--dm-radius-sm)] border border-line-strong px-5 py-3 text-base font-semibold text-strong transition-colors hover:bg-surface-sunken disabled:opacity-60"
          >
            {testando ? "Testando…" : "Testar o envio de e-mail"}
          </button>

          <p className="text-xs text-muted">
            Salve primeiro, depois clique aqui para conferir.
          </p>
        </div>

        {testeEmail ? (
          <p
            role="status"
            className={`mt-3 rounded-[var(--dm-radius-sm)] px-4 py-3 text-sm font-semibold ${
              testeEmail.startsWith("Conectou")
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger"
            }`}
          >
            {testeEmail}
          </p>
        ) : null}
      </section>

      <section className="rounded-[var(--dm-radius-lg)] border border-line bg-surface-raised p-5 sm:p-6">
        <h2 className="font-display text-xl text-strong">
          6. Faixa de anúncio
        </h2>
        <p className="mt-1 text-sm text-muted">
          A faixa ocupa a largura da página. Aqui você escolhe a altura dela.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="bannerFormato"
              className="mb-1.5 block text-sm font-semibold text-strong"
            >
              Altura da faixa
            </label>
            <select
              id="bannerFormato"
              name="bannerFormato"
              defaultValue={config.bannerFormato}
              className={campo}
            >
              <option value="fino">Fina — arte de 1200 × 120</option>
              <option value="medio">Média — arte de 1200 × 200</option>
              <option value="grande">Grande — arte de 1200 × 280</option>
            </select>
            <p className="mt-1.5 text-xs text-muted">
              Peça a arte ao anunciante na medida que você escolher aqui.
            </p>
          </div>

          <Campo
            id="bannerSegundos"
            label="Segundos de cada anunciante"
            valor={config.bannerSegundos}
            tipo="number"
            hint="Tempo que cada propaganda fica antes de entrar a próxima."
          />
        </div>
      </section>

      {erro ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-[var(--dm-radius-sm)] bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
        >
          <AlertIcon className="size-4 shrink-0" />
          {erro}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-[var(--dm-radius-sm)] bg-gold-400 px-6 py-3.5 text-base font-semibold text-on-brand transition-colors hover:bg-gold-300 disabled:opacity-60"
        >
          {salvando ? "Salvando…" : "Salvar configurações"}
        </button>

        {salvo ? (
          <p
            role="status"
            className="inline-flex items-center gap-2 text-base font-semibold text-success"
          >
            <CheckIcon className="size-5" />
            Salvo! O site já está usando os novos dados.
          </p>
        ) : null}
      </div>
    </form>
  );
}
