(() => {
  'use strict';
  const base = '/doce-louvor-backup/';
  const paths = new Set(['', 'sobre/', 'anuncie/', 'afiliados/', 'contato/', 'blog/', 'blog/louvor-gospel/', 'blog/musicas-gospel/', 'blog/louvor-e-adoracao/'].map(path => base + path));
  const audio = document.getElementById('persistent-radio-audio');
  const player = document.getElementById('persistent-radio-player');
  const message = document.getElementById('navigation-message');
  if (!audio || !player || !document.getElementById('radio-page')) return;
  audio.dataset.instance = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const status = player.querySelector('.status');
  let current = new URL(location.href), pending, serial = 0, retryURL;
  const cache = new Map();
  function update() {
    document.querySelectorAll('[data-play]').forEach(button => {
      button.setAttribute('aria-pressed', String(!audio.paused));
      if (button.classList.contains('play')) {
        button.textContent = audio.paused ? '▶' : 'Ⅱ';
        button.setAttribute('aria-label', audio.paused ? 'Ouvir rádio ao vivo' : 'Pausar rádio');
      } else button.textContent = audio.paused ? '▶  Ouvir ao vivo' : 'Ⅱ  Pausar rádio';
    });
    status.textContent = audio.paused ? 'Pronto para ouvir' : 'Você está ouvindo ao vivo';
  }
  async function toggle() {
    if (!audio.paused) return audio.pause();
    status.textContent = 'Conectando à rádio…';
    try { await audio.play(); } catch { status.textContent = 'Não foi possível conectar. Tente novamente.'; }
  }
  audio.volume = Number(player.querySelector('#volume').value);
  audio.addEventListener('play', update);audio.addEventListener('pause', update);audio.addEventListener('playing', update);
  audio.addEventListener('waiting', () => { if (!audio.paused) status.textContent = 'Conectando à rádio…'; });
  audio.addEventListener('error', () => { status.textContent = 'Transmissão indisponível no momento.'; });
  player.querySelector('#volume').addEventListener('input', event => { audio.volume = Number(event.target.value); });
  function closeMenu() {
    document.querySelector('.navlinks')?.classList.remove('open');
    document.querySelectorAll('[aria-controls="navegacao"],[aria-controls="menu-mobile"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    document.querySelector('.radio-mobile-menu')?.setAttribute('hidden', '');
  }
  function toggleMenu(button) {
    const nav = document.querySelector('.navlinks');
    if (nav) {
      const open = nav.classList.toggle('open');button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    } else {
      let mobile = document.querySelector('.radio-mobile-menu');
      if (!mobile) {
        mobile = document.createElement('nav');mobile.className = 'radio-mobile-menu';mobile.id = 'menu-mobile';
        mobile.setAttribute('aria-label', 'Menu para celular');mobile.hidden = true;
        document.querySelector('header nav').querySelectorAll('a').forEach(link => mobile.append(link.cloneNode(true)));
        document.querySelector('header').append(mobile);
      }
      mobile.hidden = !mobile.hidden;button.setAttribute('aria-expanded', String(!mobile.hidden));
    }
  }
  const key = url => url.pathname + url.search;
  function rememberPosition() { history.replaceState({ ...history.state, radioPosition: [scrollX, scrollY] }, '', location.href); }
  function cacheDocument(url, text) {
    cache.delete(key(url));cache.set(key(url), text);
    if (cache.size > 6) cache.delete(cache.keys().next().value);
  }
  function scrollToTarget(url, position) {
    if (url.hash) {
      let id;try { id = decodeURIComponent(url.hash.slice(1)); } catch { id = url.hash.slice(1); }
      const target = document.getElementById(id);
      if (target) { target.scrollIntoView({ behavior: 'instant' });return; }
    }
    scrollTo({ left: position?.[0] || 0, top: position?.[1] || 0, behavior: 'instant' });
  }
  async function navigate(url, { pop = false, position } = {}) {
    const token = ++serial;
    pending?.abort();pending = new AbortController();const controller = pending;
    if (!pop) rememberPosition();
    closeMenu();message.hidden = true;
    if (key(url) === key(current)) {
      document.getElementById('radio-page').removeAttribute('aria-busy');
      if (!pop) history.pushState({ radioPosition: [0, 0] }, '', url);
      current = url;scrollToTarget(url, position);return;
    }
    document.getElementById('radio-page').setAttribute('aria-busy', 'true');
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      let text = cache.get(key(url));
      if (!text) {
        const response = await fetch(url.pathname + url.search, { signal: controller.signal, credentials: 'same-origin', headers: { Accept: 'text/html' } });
        if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('Page unavailable');
        const finalURL = new URL(response.url);
        if (finalURL.origin !== location.origin || !paths.has(finalURL.pathname)) throw new Error('Unsupported redirect');
        text = await response.text();
      }
      if (token !== serial) return;
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const next = doc.getElementById('radio-page');
      if (doc.documentElement.dataset.radioNavigation !== '1' || !next || !next.querySelector('main')) throw new Error('Invalid page');
      if (next.querySelector('script, audio, #persistent-radio-player')) throw new Error('Unexpected executable content');
      const imported = document.importNode(next, true);
      document.getElementById('radio-page').replaceWith(imported);
      document.title = doc.title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = doc.querySelector('meta[name="description"]')?.content || '';
      if (!pop) history.pushState({ radioPosition: [0, 0] }, '', url);
      current = url;cacheDocument(url, text);update();
      const main = imported.querySelector('main');main.setAttribute('tabindex', '-1');main.focus({ preventScroll: true });
      scrollToTarget(url, position);
    } catch {
      if (token !== serial) return;
      if (pop) history.replaceState({ radioPosition: [scrollX, scrollY] }, '', current);
      retryURL = url;
      message.replaceChildren(document.createTextNode('Não foi possível abrir esta página. A rádio continua disponível.'));
      const retry = document.createElement('button');retry.type = 'button';retry.textContent = 'Tentar novamente';
      retry.addEventListener('click', () => navigate(retryURL));message.append(retry);message.hidden = false;
    } finally {
      clearTimeout(timeout);
      if (token === serial) document.getElementById('radio-page').removeAttribute('aria-busy');
    }
  }
  document.addEventListener('click', event => {
    const play = event.target.closest('[data-play]');
    if (play) { event.preventDefault();toggle();return; }
    const menu = event.target.closest('.menu,[aria-controls="menu-mobile"]');
    if (menu) { event.preventDefault();toggleMenu(menu);return; }
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !paths.has(url.pathname)) return;
    event.preventDefault();navigate(url);
  });
  history.scrollRestoration = 'manual';
  history.replaceState({ ...history.state, radioPosition: [scrollX, scrollY] }, '', location.href);
  addEventListener('popstate', event => navigate(new URL(location.href), { pop: true, position: event.state?.radioPosition }));
  update();
})();
