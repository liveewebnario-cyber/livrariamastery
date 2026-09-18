// ============================================================
// EBOOKS STORE - APP.JS
// Integração completa com Supabase
// ============================================================

const App = (() => {
  // ---- Cliente Supabase ----
  const sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  // ---- Cache simples ----
  const cache = {};
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  async function cachedFetch(key, fetcher) {
    const now = Date.now();
    if (cache[key] && now - cache[key].ts < CACHE_TTL) return cache[key].data;
    const data = await fetcher();
    cache[key] = { data, ts: now };
    return data;
  }

  // ---- Helpers ----
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const discount = (old, novo) => old ? Math.round((1 - novo / old) * 100) : 0;

  // ---- Aplicar cores do site_config ----
  function applyColors(cfg) {
    const root = document.documentElement;
    if (cfg.primary_color) root.style.setProperty('--primary', cfg.primary_color);
    if (cfg.secondary_color) root.style.setProperty('--secondary', cfg.secondary_color);
    if (cfg.accent_color) root.style.setProperty('--accent', cfg.accent_color);
  }

  // ---- Carregar site_config ----
  async function loadSiteConfig() {
    try {
      const { data } = await sb.from('site_config').select('*').eq('id', 1).single();
      if (!data) return;
      applyColors(data);

      // Logo
      const logoEl = $('#site-logo');
      if (logoEl) {
        if (data.logo_url) {
          logoEl.innerHTML = `<img src="${data.logo_url}" alt="${data.site_name}" />`;
        } else {
          logoEl.innerHTML = `<span class="site-logo-text">${data.site_name}</span>`;
        }
      }

      // Título da página
      if (data.site_name) document.title = document.title.replace('{{SITE_NAME}}', data.site_name);

      // Footer
      const footerLogoEl = $('#footer-logo');
      if (footerLogoEl) footerLogoEl.textContent = data.site_name || '';

      const footerTagEl = $('#footer-tagline');
      if (footerTagEl) footerTagEl.textContent = data.tagline || '';

      $$('.footer-address').forEach(el => el.textContent = data.address || '');
      $$('.footer-phone').forEach(el => el.textContent = data.phone || '');
      $$('.footer-email').forEach(el => { el.textContent = data.email || ''; el.href = `mailto:${data.email}`; });

      const footerTextEl = $('#footer-text');
      if (footerTextEl) footerTextEl.textContent = data.footer_text || '';

    } catch (e) {
      console.warn('site_config:', e.message);
    }
  }

  // ---- Carregar Menu ----
  async function loadMenu() {
    try {
      const cats = await cachedFetch('categories', async () => {
        const { data } = await sb.from('categories').select('*').eq('active', true).order('sort_order');
        return data || [];
      });

      const menuEl = $('#nav-menu');
      if (!menuEl) return;

      const currentSlug = getPageSlug();
      menuEl.innerHTML = `
        <li><a href="${getBaseUrl()}" class="${!currentSlug ? 'active' : ''}">Início</a></li>
        ${cats.map(c => `
          <li><a href="${getBaseUrl()}?cat=${c.slug}" class="${currentSlug === c.slug ? 'active' : ''}">${c.name}</a></li>
        `).join('')}
      `;
    } catch (e) {
      console.warn('menu:', e.message);
    }
  }

  // ---- Banner Rotativo ----
  async function loadBanner() {
    try {
      const { data: banners } = await sb.from('banners').select('*').eq('active', true).order('sort_order');
      if (!banners || !banners.length) { $('#banner-section')?.remove(); return; }

      const track = $('#banner-track');
      const dots = $('#banner-dots');
      if (!track) return;

      track.innerHTML = banners.map(b => `
        <div class="banner-slide">
          <img src="${b.image_url}" alt="${b.title}" loading="eager" />
          <div class="banner-content">
            ${b.title ? `<h2>${b.title}</h2>` : ''}
            ${b.subtitle ? `<p>${b.subtitle}</p>` : ''}
            ${b.button_text && b.link_url ? `<a href="${b.link_url}" class="banner-btn">${b.button_text}</a>` : ''}
          </div>
        </div>
      `).join('');

      if (dots) {
        dots.innerHTML = banners.map((_, i) => `<button class="banner-dot ${i === 0 ? 'active' : ''}" data-i="${i}"></button>`).join('');
        dots.addEventListener('click', e => {
          if (e.target.dataset.i !== undefined) goToSlide(+e.target.dataset.i);
        });
      }

      let current = 0;
      const total = banners.length;
      let timer;

      function goToSlide(n) {
        current = (n + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        $$('.banner-dot').forEach((d, i) => d.classList.toggle('active', i === current));
        resetTimer();
      }

      function resetTimer() {
        clearInterval(timer);
        timer = setInterval(() => goToSlide(current + 1), 5000);
      }

      $('#banner-prev')?.addEventListener('click', () => goToSlide(current - 1));
      $('#banner-next')?.addEventListener('click', () => goToSlide(current + 1));
      resetTimer();

    } catch (e) {
      console.warn('banner:', e.message);
    }
  }

  // ---- Criar card de ebook ----
  function createCard(ebook) {
    const disc = discount(ebook.old_price, ebook.new_price);
    const card = document.createElement('div');
    card.className = 'ebook-card';
    card.innerHTML = `
      ${ebook.badge ? `<span class="ebook-badge">${ebook.badge}</span>` : ''}
      <img class="ebook-cover" src="${ebook.cover_url || 'https://placehold.co/300x400/eee/999?text=Capa'}" alt="${ebook.title}" loading="lazy" />
      <div class="ebook-info">
        <h3 class="ebook-title">${ebook.title}</h3>
        ${ebook.rating > 0 ? `
          <div class="ebook-stars">
            ${[...Array(Math.min(5, Math.max(0, Math.round(Number(ebook.rating) || 0))))].map(() => '★').join('')}
            ${[...Array(5 - Math.min(5, Math.max(0, Math.round(Number(ebook.rating) || 0))))].map(() => '<span class="star-off">★</span>').join('')}
            <span class="ebook-stars-count">${ebook.rating}${ebook.rating_count > 0 ? ` (${ebook.rating_count})` : ''}</span>
          </div>` : ''}
        <div class="ebook-prices">
          ${ebook.old_price ? `<span class="ebook-old-price">${fmt(ebook.old_price)}</span>` : ''}
          <span class="ebook-new-price">${fmt(ebook.new_price)}</span>
          ${disc > 0 ? `<span class="ebook-discount">-${disc}%</span>` : ''}
        </div>
        ${ebook.short_description ? `
          <div class="ebook-desc-wrapper">
            <button class="ebook-desc-toggle" aria-expanded="false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Saiba mais
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:auto"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="ebook-desc-dropdown">${ebook.short_description}</div>
          </div>
        ` : ''}
        <a href="${ebook.checkout_url || '#'}" target="_blank" rel="noopener" class="ebook-buy-btn">🛒 Comprar Agora</a>
      </div>
    `;

    // Dropdown toggle
    const toggle = card.querySelector('.ebook-desc-toggle');
    const dropdown = card.querySelector('.ebook-desc-dropdown');
    if (toggle && dropdown) {
      function openDrop() { toggle.classList.add('open'); dropdown.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); }
      function closeDrop() { toggle.classList.remove('open'); dropdown.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }

      // Hover (desktop)
      card.querySelector('.ebook-desc-wrapper').addEventListener('mouseenter', openDrop);
      card.querySelector('.ebook-desc-wrapper').addEventListener('mouseleave', closeDrop);
      // Click (mobile)
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.contains('open') ? closeDrop() : openDrop();
      });
    }

    return card;
  }

  // ---- Carregar ebooks por categoria ----
  async function loadEbooksByCategory(catSlug, containerEl, limit = null) {
    try {
      // Buscar id da categoria
      const cats = await cachedFetch('categories', async () => {
        const { data } = await sb.from('categories').select('*').eq('active', true).order('sort_order');
        return data || [];
      });
      const cat = cats.find(c => c.slug === catSlug);
      if (!cat) return;

      let query = sb.from('ebooks')
        .select('*')
        .eq('category_id', cat.id)
        .eq('active', true)
        .order('sort_order');
      if (limit) query = query.limit(limit);

      const { data: ebooks } = await query;
      if (!ebooks || !ebooks.length) {
        containerEl.innerHTML = '<p style="color:#999;text-align:center;grid-column:1/-1;padding:40px 0">Nenhum ebook encontrado nesta categoria.</p>';
        return;
      }

      containerEl.innerHTML = '';
      ebooks.forEach(e => containerEl.appendChild(createCard(e)));
    } catch (err) {
      console.error('ebooks:', err);
    }
  }

  // ---- Página Home: mostrar 4 ebooks por categoria ----
  async function loadHomePage() {
    const mainEl = $('#main-content');
    if (!mainEl) return;

    const cats = await cachedFetch('categories', async () => {
      const { data } = await sb.from('categories').select('*').eq('active', true).order('sort_order');
      return data || [];
    });

    mainEl.innerHTML = `
      <div class="home-hero">
        <h1>Os melhores ebooks para sua <span>saúde e bem-estar</span></h1>
        <p>Conteúdo especializado para cuidar de você em todas as fases da vida</p>
      </div>
    `;

    try {
      const { data: featured } = await sb.from('ebooks').select('*').eq('featured', true).eq('active', true).limit(1);
      if (featured?.[0]) {
        const e = featured[0];
        const d = discount(e.old_price, e.new_price);
        const sec = document.createElement('section');
        sec.className = 'container';
        sec.innerHTML = `
          <div class="featured-block">
            <div class="featured-cover">
              <img src="${e.cover_url || 'https://placehold.co/300x400/eee/999?text=Capa'}" alt="${e.title}" onerror="this.src='https://placehold.co/300x400/eee/999?text=Capa'"/>
            </div>
            <div class="featured-info">
              <span class="featured-tag">⭐ Novidade destacada</span>
              <h2 class="featured-title">${e.title}</h2>
              <div class="featured-prices">
                ${e.old_price ? `<span class="old">${fmt(e.old_price)}</span>` : ''}
                <span class="new">${fmt(e.new_price)}</span>
                ${d > 0 ? `<span class="disc">-${d}%</span>` : ''}
              </div>
              <p class="featured-desc">${(e.short_description || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</p>
              <div class="featured-actions">
                ${e.badge ? `<span class="featured-badge">🏆 ${e.badge}</span>` : ''}
                <a href="${e.checkout_url || '#'}" target="_blank" rel="noopener" class="ebook-buy-btn">🛒 Comprar Agora</a>
              </div>
            </div>
          </div>
        `;
        mainEl.appendChild(sec);
      }
    } catch (err) { console.error('featured:', err); }

    await renderThematicShelves(mainEl);

    for (const cat of cats) {
      const section = document.createElement('section');
      section.className = 'category-section container';
      section.innerHTML = `
        <div class="category-header">
          <div>
            <h2 class="section-title">${cat.icon} ${cat.name}</h2>
            <div class="section-divider"></div>
          </div>
          <a href="${getBaseUrl()}?cat=${cat.slug}" class="view-all-link">
            Ver todos →
          </a>
        </div>
        <div class="ebooks-grid" id="grid-${cat.slug}">
          ${skeletonHTML(4)}
        </div>
      `;
      mainEl.appendChild(section);
      loadEbooksByCategory(cat.slug, section.querySelector(`#grid-${cat.slug}`), 4);
    }
  }

  // ---- Página de Categoria ----
  async function loadCategoryPage(slug) {
    const mainEl = $('#main-content');
    if (!mainEl) return;

    const cats = await cachedFetch('categories', async () => {
      const { data } = await sb.from('categories').select('*').eq('active', true).order('sort_order');
      return data || [];
    });
    const cat = cats.find(c => c.slug === slug);
    if (!cat) { mainEl.innerHTML = '<p style="text-align:center;padding:60px 20px;color:#999">Categoria não encontrada.</p>'; return; }

    document.title = `${cat.name} - ${document.title}`;

    mainEl.innerHTML = `
      <div class="container">
        <h1 class="section-title">${cat.icon} <span>${cat.name}</span></h1>
        <div class="section-divider"></div>
        <p class="section-subtitle">${cat.description || 'Explore nossa seleção de ebooks nesta categoria.'}</p>
        <div class="ebooks-grid" id="cat-grid">
          ${skeletonHTML(8)}
        </div>
      </div>
    `;

    loadEbooksByCategory(slug, $('#cat-grid'));
  }

  // ---- Fileiras temáticas (Ofertas / Lançamentos / Mais avaliados) ----
  let allBooksCache = null;
  async function getAllBooks() {
    if (allBooksCache) return allBooksCache;
    const { data } = await sb.from('ebooks').select('*')
      .eq('active', true).order('created_at', { ascending: false }).limit(200);
    allBooksCache = data || [];
    return allBooksCache;
  }

  function shelfLists(books) {
    const ofertas = books
      .filter(e => e.old_price && e.new_price && e.old_price > e.new_price)
      .sort((a, b) => discount(b.old_price, b.new_price) - discount(a.old_price, a.new_price));
    const lancamentos = books.slice(0, 4);
    const top = books.filter(e => Number(e.rating) > 0)
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    return { ofertas, lancamentos, top };
  }

  async function renderThematicShelves(mainEl) {
    try {
      const books = await getAllBooks();
      if (!books.length) return;
      const { ofertas, lancamentos, top } = shelfLists(books);
      const shelves = [
        { key: 'ofertas', title: '🔥 Ofertas da Semana', items: ofertas },
        { key: 'lancamentos', title: '🆕 Lançamentos', items: lancamentos },
        { key: 'top', title: '⭐ Mais Avaliados', items: top },
      ];
      for (const s of shelves) {
        if (!s.items.length) continue;
        const sec = document.createElement('section');
        sec.className = 'category-section container';
        sec.innerHTML = `
          <div class="category-header">
            <div>
              <h2 class="section-title">${s.title}</h2>
              <div class="section-divider"></div>
            </div>
            <a href="${getBaseUrl()}?view=${s.key}" class="view-all-link">Ver lista completa →</a>
          </div>
          <div class="ebooks-grid"></div>`;
        const grid = sec.querySelector('.ebooks-grid');
        s.items.slice(0, 4).forEach(e => grid.appendChild(createCard(e)));
        mainEl.appendChild(sec);
      }
    } catch (err) { console.error('shelves:', err); }
  }

  async function loadViewPage(view) {
    const mainEl = $('#main-content');
    if (!mainEl) return;
    const titles = {
      ofertas: '🔥 Ofertas da Semana',
      lancamentos: '🆕 Lançamentos',
      top: '⭐ Mais Avaliados',
    };
    if (!titles[view]) return loadHomePage();

    document.title = `${titles[view].replace(/^\S+\s/, '')} — Mastery Ebooks`;

    mainEl.innerHTML = `
      <div class="container">
        <h1 class="section-title"><span>${titles[view]}</span></h1>
        <div class="section-divider"></div>
        <p class="section-subtitle">Mostrando todos os ebooks desta seleção.</p>
        <div class="ebooks-grid" id="view-grid">${skeletonHTML(8)}</div>
        <p style="margin:30px 0;text-align:center"><a href="${getBaseUrl()}" class="view-all-link">← Voltar para a página inicial</a></p>
      </div>
    `;

    try {
      const books = await getAllBooks();
      const { ofertas, lancamentos, top } = shelfLists(books);
      const items = view === 'ofertas' ? ofertas : (view === 'top' ? top : lancamentos);
      const grid = $('#view-grid');
      grid.innerHTML = '';
      if (!items.length) {
        grid.innerHTML = '<p style="color:#999;text-align:center;grid-column:1/-1;padding:40px 0">Nenhum ebook nesta seleção no momento.</p>';
      } else {
        items.forEach(e => grid.appendChild(createCard(e)));
      }
    } catch (err) {
      console.error('view:', err);
      $('#view-grid').innerHTML = '<p style="color:#c00;text-align:center;grid-column:1/-1;padding:40px 0">Erro ao carregar.</p>';
    }
  }

  // ---- Skeleton loading ----
  function skeletonHTML(n) {
    return Array(n).fill(`
      <div class="skeleton">
        <div class="skeleton-img"></div>
        <div class="skeleton-text">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    `).join('');
  }

  // ---- Helpers de URL ----
  function getPageParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function getBaseUrl() {
    return window.location.pathname;
  }

  // ---- Newsletter ----
  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const email = document.getElementById('newsletter-email').value.trim().toLowerCase();
      const msg = document.getElementById('newsletter-msg');
      const btn = document.getElementById('newsletter-btn');
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        msg.textContent = 'Digite um e-mail válido.';
        msg.className = 'newsletter-msg err';
        return;
      }
      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = 'Cadastrando...';
      try {
        const { error } = await sb.from('newsletters').insert({ email });
        if (error) {
          if (error.code === '23505') { msg.textContent = 'Este e-mail já está cadastrado. 😉'; msg.className = 'newsletter-msg ok'; }
          else throw error;
        } else {
          msg.textContent = '✅ E-mail cadastrado com sucesso!';
          msg.className = 'newsletter-msg ok';
          document.getElementById('newsletter-email').value = '';
        }
      } catch (err) {
        console.error('newsletter:', err);
        msg.textContent = 'Erro ao cadastrar. Tente novamente.';
        msg.className = 'newsletter-msg err';
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  // ---- Init ----
  async function init() {
    try {
      initNewsletter();
      await Promise.all([loadSiteConfig(), loadMenu(), loadBanner()]);

      const slug = getPageParam('cat');
      const view = getPageParam('view');
      if (slug) {
        await loadCategoryPage(slug);
      } else if (view) {
        await loadViewPage(view);
      } else {
        await loadHomePage();
      }
    } catch (e) {
      console.error('App init error:', e);
    } finally {
      // Esconder loader
      const loader = $('#page-loader');
      if (loader) loader.classList.add('hidden');
    }
  }

  // Nav toggle mobile
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#nav-toggle');
    if (toggle) {
      const menu = document.getElementById('nav-menu');
      menu?.classList.toggle('open');
    }
  });

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
