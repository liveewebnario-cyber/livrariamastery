/**
 * Theme Ebooks App - PRD v1.0
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Setup Supabase
    const { createClient } = supabase;
    const client = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

    let activeCategoryId = null;
    let categories = [];

    // 2. Fetch Initial Data
    async function init() {
        const [configRes, catRes, bannerRes] = await Promise.all([
            client.from('site_config').select('*').single(),
            client.from('categories').select('*').eq('active', true).order('sort_order'),
            client.from('banners').select('*').eq('active', true).order('sort_order')
        ]);

        if (configRes.data) applyConfig(configRes.data);
        if (catRes.data) {
            categories = catRes.data;
            renderMenus(catRes.data);
        }
        if (bannerRes.data) window.BannerSlider.init(bannerRes.data);

        fetchEbooks();
        setupGlobalEvents();
        lucide.createIcons();
    }

    // 3. Apply Site Config
    function applyConfig(config) {
        // Logo
        const logoContainer = document.getElementById('site-logo-container');
        if (config.logo_url) {
            logoContainer.innerHTML = `<img src="${config.logo_url}" class="h-10 w-auto" alt="${config.site_name}">`;
        } else {
            logoContainer.innerText = config.site_name || 'MASTERY EBOOKS';
        }

        // Footer Info
        document.getElementById('footer-site-name').innerText = config.site_name || '';
        document.getElementById('footer-text-content').innerText = config.footer_text || '';
        document.getElementById('footer-address').innerText = config.address || '';
        document.getElementById('footer-phone').innerText = config.phone || '';
        document.getElementById('footer-email').innerText = config.email || '';

        // Colors
        document.documentElement.style.setProperty('--primary-color', config.primary_color || '#6C3483');
        document.documentElement.style.setProperty('--secondary-color', config.secondary_color || '#F1C40F');
    }

    // 4. Navigation Menus
    function renderMenus(cats) {
        const desktop = document.getElementById('desktop-menu');
        const mobile = document.getElementById('mobile-menu-container');

        const menuItems = [
            { id: null, name: 'Todos', slug: 'todos' },
            ...cats
        ];

        const html = menuItems.map(item => `
            <button 
                class="cat-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.id === activeCategoryId ? 'active-cat' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}" 
                data-id="${item.id || ''}"
                data-name="${item.name}"
            >
                ${item.name}
            </button>
        `).join('');

        desktop.innerHTML = html;
        mobile.innerHTML = menuItems.map(item => `
             <button 
                class="cat-link block w-full text-left px-3 py-2 rounded-md text-base font-medium ${item.id === activeCategoryId ? 'active-cat' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}" 
                data-id="${item.id || ''}"
                data-name="${item.name}"
            >
                ${item.name}
            </button>
        `).join('');

        // Attach Clicks
        document.querySelectorAll('.cat-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id || null;
                const name = e.target.dataset.name;
                activeCategoryId = id;
                document.getElementById('category-title').innerText = name === 'Todos' ? 'Nossa Coleção' : name;

                // Update active state in UI
                document.querySelectorAll('.cat-link').forEach(link => {
                    if (link.dataset.id === (id || '')) link.classList.add('active-cat');
                    else link.classList.remove('active-cat');
                });

                fetchEbooks();
                document.getElementById('mobile-menu').classList.add('hidden');
            });
        });
    }

    // 5. Fetch Ebooks
    async function fetchEbooks() {
        const grid = document.getElementById('ebook-grid');
        const empty = document.getElementById('empty-state');
        const count = document.getElementById('ebook-count');

        grid.innerHTML = Array(4).fill(0).map(() => `<div class="animate-pulse bg-gray-200 rounded-2xl h-96"></div>`).join('');
        empty.classList.add('hidden');

        let query = client.from('ebooks').select('*').eq('active', true).order('sort_order');
        if (activeCategoryId) {
            query = query.eq('category_id', activeCategoryId);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            count.innerText = '0 produtos';
            return;
        }

        count.innerText = `${data.length} ${data.length === 1 ? 'produto' : 'produtos'}`;
        renderEbooks(data);
    }

    function renderEbooks(ebooks) {
        const grid = document.getElementById('ebook-grid');
        grid.innerHTML = ebooks.map(ebook => {
            const rating = Math.min(5, Math.max(0, Math.round(Number(ebook.rating) || 0)));
            const stars = Array.from({length:5}, (_, i) =>
                `<i data-lucide="star" class="w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}"></i>`).join('');
            const save = (ebook.old_price && ebook.old_price > ebook.new_price) ? (ebook.old_price - ebook.new_price) : 0;
            return `
            <div class="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col relative">
                <!-- Cover -->
                <div class="relative aspect-[3/4] overflow-hidden">
                    <img src="${ebook.cover_url || 'https://via.placeholder.com/300x400?text=Sem+Capa'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${ebook.title}">
                    
                    <!-- Dropdown Hover (Mini Description) -->
                    <div class="ebook-dropdown absolute inset-0 bg-white/95 flex flex-col p-8 justify-center text-center">
                        <h4 class="font-bold text-gray-900 mb-4">Sobre este livro</h4>
                        <p class="text-sm text-gray-600 line-clamp-8 leading-relaxed mb-6">
                            ${ebook.short_description || 'Nenhuma descrição disponível.'}
                        </p>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-lg font-bold text-gray-900 mb-1 line-clamp-2 h-14" title="${ebook.title}">${ebook.title}</h3>
                    ${rating > 0 ? `<div class="flex gap-0.5 mb-3">${stars}</div>` : `<div class="mb-3"></div>`}
                    
                    <div class="mt-auto">
                        <div class="mb-1">
                            ${ebook.old_price ? `<span class="line-through-price text-xs">de R$ ${ebook.old_price.toFixed(2)}</span>` : ''}
                            <div class="text-2xl font-black text-indigo-700">Por R$ ${ebook.new_price.toFixed(2)}</div>
                        </div>
                        ${save > 0 ? `<p class="text-green-700 font-semibold text-xs mb-4">✔ Economize R$ ${save.toFixed(2)}</p>` : `<div class="mb-4"></div>`}
                        
                        <a href="${ebook.checkout_url}" target="_blank" class="block w-full text-center py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                            COMPRAR AGORA
                        </a>
                        <button onclick="openEbookPopup(${JSON.stringify(ebook).replace(/"/g,'&quot;')})" class="block w-full text-center py-3 mt-2 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-100 transition-colors text-sm">
                            💬 Saiba mais
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
        lucide.createIcons();
    }

    // ================================================================
    // POPUP DE DETALHES (Saiba mais)
    // ================================================================
    function escP(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function mdToP(text) {
        if (!text) return '';
        const inline = s => escP(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`(.+?)`/g,'<code>$1</code>');
        const lines = String(text).split(/\r?\n/);
        let out = '', list = [];
        const flush = () => { if(list.length){ out += '<ul>'+list.map(l => `<li>${inline(l)}</li>`).join('') + '</ul>'; list = []; } };
        for (const raw of lines) {
            const line = raw.trimEnd();
            const h = line.match(/^(#{1,6})\s+(.*)$/);
            if (h) { flush(); const lvl = h[1].length; out += `<h${lvl}>${inline(h[2])}</h${lvl}>`; continue; }
            const li = line.match(/^[-*]\s+(.*)$/);
            if (li) { list.push(li[1]); continue; }
            if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) { flush(); out += '<hr/>'; continue; }
            if (!line.trim()) { flush(); continue; }
            flush(); out += `<p>${inline(line)}</p>`;
        }
        flush();
        return out;
    }

    function openEbookPopup(e) {
        if (!e) return;
        let ov = document.getElementById('ebook-popup-overlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'ebook-popup-overlay';
            ov.className = 'fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm items-center justify-center p-4 overflow-y-auto';
            ov.style.display = 'none';
            ov.addEventListener('click', (ev) => { if (ev.target === ov) closeEbookPopup(); });
            document.body.appendChild(ov);
            const css = document.createElement('style');
            css.textContent = `
#ebook-popup-overlay .pd-popup-content{font-size:.9rem;line-height:1.7;color:#374151;overflow-y:auto;max-height:min(38vh,220px);padding-right:8px}
#ebook-popup-overlay .pd-popup-content h1,#ebook-popup-overlay .pd-popup-content h2,#ebook-popup-overlay .pd-popup-content h3,#ebook-popup-overlay .pd-popup-content h4{color:#0f172a;font-weight:800;margin:1em 0 .35em;line-height:1.3}
#ebook-popup-overlay .pd-popup-content h1{font-size:1.2rem}#ebook-popup-overlay .pd-popup-content h2{font-size:1.05rem}#ebook-popup-overlay .pd-popup-content h3,#ebook-popup-overlay .pd-popup-content h4{font-size:.95rem}
#ebook-popup-overlay .pd-popup-content h1:first-child,#ebook-popup-overlay .pd-popup-content h2:first-child{margin-top:0}
#ebook-popup-overlay .pd-popup-content p{margin:.45em 0}
#ebook-popup-overlay .pd-popup-content ul{margin:.45em 0;padding-left:1.3em;list-style:disc}
#ebook-popup-overlay .pd-popup-content li{margin:.18em 0}
#ebook-popup-overlay .pd-popup-content hr{border:none;border-top:1px dashed #dfe1e4;margin:.9em 0}
#ebook-popup-overlay .pd-popup-content strong{color:#4338ca}
#ebook-popup-overlay .pd-popup-content code{background:#f1f5f9;padding:.1em .4em;border-radius:4px;font-size:.85em;color:#4338ca}`;
            document.head.appendChild(css);
        }

        const r = Math.min(5, Math.max(0, Math.round(Number(e.rating) || 0)));
        const stars = Array.from({length:5}, (_, i) =>
            `<i data-lucide="star" class="w-4 h-4 ${i < r ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}"></i>`).join('');
        const save = (e.old_price && e.old_price > e.new_price) ? e.old_price - e.new_price : 0;
        const d = e.old_price ? Math.round((1 - e.new_price / e.old_price) * 100) : 0;

        ov.innerHTML = `
        <div class="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl flex flex-col sm:flex-row overflow-hidden my-auto">
            <button onclick="closeEbookPopup()" class="absolute top-3 right-3 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 w-9 h-9 rounded-full text-lg font-bold shadow" aria-label="Fechar">✕</button>
            <div class="sm:w-60 shrink-0">
                <img src="${e.cover_url || 'https://via.placeholder.com/300x400?text=Capa'}" class="w-full aspect-[3/4] object-cover" alt="${escP(e.title)}">
            </div>
            <div class="p-6 flex-1">
                <h2 class="text-xl font-black text-gray-900 mb-1 pr-8">${escP(e.title)}</h2>
                ${r > 0 ? `<div class="flex gap-0.5 mb-3">${stars}</div>` : ''}
                <div class="flex items-center gap-2 mb-4 flex-wrap">
                    ${e.old_price ? `<span class="text-sm text-gray-400 line-through">R$ ${e.old_price.toFixed(2)}</span>` : ''}
                    <span class="text-3xl font-black text-indigo-700">R$ ${e.new_price.toFixed(2)}</span>
                    ${d > 0 ? `<span class="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">-${d}%</span>` : ''}
                    ${save > 0 ? `<span class="basis-full text-xs font-semibold text-green-700">✔ Economize R$ ${save.toFixed(2)}</span>` : ''}
                </div>
                <div class="grid grid-cols-3 gap-2 text-[.68rem] text-gray-500 mb-4 pt-4 border-t border-gray-100">
                    <span>🔒 Compra segura</span>
                    <span>⚡ Entrega automática</span>
                    <span>✅ Produto original</span>
                </div>
                <a href="${e.checkout_url || '#'}" target="_blank" class="block w-full text-center py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 mb-4">COMPRAR AGORA</a>
                <div class="pd-popup-content">${mdToP(e.full_description || e.short_description || '')}</div>
            </div>
        </div>`;
        ov.style.display = 'flex';
        lucide.createIcons();
    }

    function closeEbookPopup() {
        const ov = document.getElementById('ebook-popup-overlay');
        if (ov) ov.style.display = 'none';
    }

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEbookPopup(); });

    // 6. Helpers
    function setupGlobalEvents() {
        document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });

        document.getElementById('reset-filter')?.addEventListener('click', () => {
            activeCategoryId = null;
            fetchEbooks();
            renderMenus(categories); // Restore "Todos" active state
        });
    }

    // Start
    init();
});
