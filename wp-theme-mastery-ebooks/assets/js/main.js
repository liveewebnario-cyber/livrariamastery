document.addEventListener('DOMContentLoaded', function () {
    // 1. Initialize Supabase
    const { createClient } = supabase;
    const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key);

    let activeCategory = 'Todos';
    let ebooks = [];
    let banners = [];

    // 2. Fetch Site Settings (Logo, Footer Contact)
    async function fetchSettings() {
        const { data, error } = await supabaseClient.from('site_settings').select('*').single();
        if (data) {
            // Update Logo
            if (data.logo_url) {
                document.getElementById('site-logo').innerHTML = `<img src="${data.logo_url}" alt="Logo" class="h-10 w-auto">`;
            }
            // Update Footer
            document.getElementById('footer-address').innerText = data.address || '';
            document.getElementById('footer-phone').innerText = data.phone || '';
            document.getElementById('footer-email').innerText = data.email || '';

            // Handle Banners
            if (data.banner_json && data.banner_json.length > 0) {
                banners = data.banner_json;
                renderBanner(0);
                startBannerRotation();
            }
        }
    }

    // 3. Render Banner
    let currentBannerIndex = 0;
    function renderBanner(index) {
        const container = document.getElementById('banner-container');
        const banner = banners[index];
        if (!banner) return;

        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = `
                <div class="absolute inset-0">
                    <img src="${banner.image}" class="w-full h-full object-cover opacity-50" alt="${banner.title}">
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-gray-900 to-transparent">
                        <h2 class="text-3xl md:text-5xl font-bold text-white mb-4 transform translate-y-0 transition-all duration-700">${banner.title || ''}</h2>
                        <p class="text-lg md:text-xl text-gray-200">${banner.subtitle || ''}</p>
                    </div>
                </div>
            `;
            container.style.opacity = '1';
            lucide.createIcons();
        }, 300);
    }

    function startBannerRotation() {
        if (banners.length <= 1) return;
        setInterval(() => {
            currentBannerIndex = (currentBannerIndex + 1) % banners.length;
            renderBanner(currentBannerIndex);
        }, 5000);
    }

    // 4. Fetch and Render Ebooks
    function formatPrice(price) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }

    async function renderFeatured() {
        const container = document.getElementById('featured-section');
        if (!container) return;
        try {
            const { data } = await supabaseClient.from('ebooks').select('*').eq('featured', true).eq('active', true).limit(1);
            const e = data?.[0];
            if (!e) return;

            const savings = e.old_price && e.new_price && e.old_price > e.new_price ? e.old_price - e.new_price : 0;
            const discount = savings > 0 ? Math.round((1 - e.new_price / e.old_price) * 100) : 0;
            const rating = Math.min(5, Math.max(0, Number(e.rating) || 0));

            container.innerHTML = `
                <div class="relative overflow-hidden bg-gradient-to-br from-blue-900/40 via-gray-900 to-purple-900/30 rounded-3xl border border-blue-800/40 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                    <div class="absolute -right-16 -top-16 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="w-40 md:w-56 flex-shrink-0 relative z-10">
                        <img src="${e.cover_url || 'https://via.placeholder.com/300x400?text=Sem+Capa'}" alt="${e.title}" class="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl shadow-gray-950/50">
                    </div>
                    <div class="flex-1 relative z-10 text-center md:text-left">
                        <span class="inline-block bg-blue-600 text-white text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">⭐ Novidade destacada</span>
                        <h3 class="text-2xl md:text-3xl font-extrabold text-white mb-2">${e.title}</h3>
                        ${rating > 0 ? `
                        <div class="flex items-center justify-center md:justify-start gap-0.5 mb-3 text-yellow-400">
                            ${[1, 2, 3, 4, 5].map(i => `<i data-lucide="star" class="${i <= Math.round(rating) ? 'fill-current text-yellow-400' : 'text-gray-600'}"></i>`).join('')}
                        </div>` : ''}
                        ${e.badge ? `<span class="inline-flex items-center gap-1.5 bg-gray-800/80 border border-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">🏆 ${e.badge}</span>` : ''}
                        ${e.short_description ? `<p class="text-gray-300 leading-relaxed mb-5 max-w-xl mx-auto md:mx-0">${e.short_description}</p>` : ''}
                        <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                            ${e.old_price ? `<span class="text-gray-400 line-through">${formatPrice(e.old_price)}</span>` : ''}
                            <span class="text-3xl font-extrabold text-emerald-400">${formatPrice(e.new_price)}</span>
                            ${discount > 0 ? `<span class="bg-emerald-500/20 text-emerald-300 font-bold text-sm px-3 py-1 rounded-lg">-${discount}%</span>` : ''}
                        </div>
                        <a href="${e.checkout_url || '#'}" target="_blank" rel="noopener" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-900/30">🛒 Comprar Agora</a>
                    </div>
                </div>
            `;
            container.classList.remove('hidden');
            lucide.createIcons();
        } catch (err) {
            console.error('featured:', err);
        }
    }

    async function fetchEbooks() {
        const grid = document.getElementById('ebooks-grid');
        const noResults = document.getElementById('no-results');

        let query = supabaseClient.from('ebooks').select('*').order('created_at', { ascending: false });

        if (activeCategory !== 'Todos') {
            query = query.eq('category', activeCategory);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching ebooks:', error);
            return;
        }

        ebooks = data || [];

        if (ebooks.length === 0) {
            grid.innerHTML = '';
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
            renderEbooks();
        }
    }

    function renderEbooks() {
        const grid = document.getElementById('ebooks-grid');
        grid.innerHTML = ebooks.map(ebook => {
            const rating = Math.min(5, Math.max(0, Math.round(Number(ebook.rating) || 0)));
            const stars = Array.from({length:5}, (_, i) =>
                `<i data-lucide="star" class="w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-700 text-gray-700'}"></i>`).join('');
            const save = (ebook.old_price && ebook.old_price > ebook.new_price) ? (ebook.old_price - ebook.new_price) : 0;
            return `
            <div class="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <!-- Cover -->
                <div class="relative aspect-[3/4] overflow-hidden">
                    <img src="${ebook.cover_url || 'https://via.placeholder.com/300x400?text=Sem+Capa'}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="${ebook.title}">
                    
                    <!-- Hover Dropdown (Mini Description) -->
                    <div class="absolute inset-0 bg-gray-900/95 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-white pointer-events-none">
                        <p class="text-sm line-clamp-6 mb-6 text-gray-300">${ebook.short_description || ''}</p>
                        <button onclick="openEbookPopup(${JSON.stringify(ebook).replace(/"/g,'&quot;')})" class="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm font-medium transition-colors pointer-events-auto">
                            Detalhes
                        </button>
                    </div>
                </div>

                <!-- Info -->
                <div class="p-5">
                    <h3 class="text-lg font-bold text-white mb-1 line-clamp-1">${ebook.title}</h3>
                    <p class="text-xs text-gray-500 mb-1 uppercase tracking-tighter">${ebook.category}</p>
                    ${rating > 0 ? `<div class="flex gap-0.5 mb-3">${stars}</div>` : `<div class="mb-3"></div>`}
                    
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col">
                            ${ebook.old_price ? `<span class="text-sm text-gray-500 line-through">R$ ${ebook.old_price.toFixed(2).replace('.', ',')}</span>` : ''}
                            <span class="text-xl font-bold text-green-400">R$ ${ebook.new_price.toFixed(2).replace('.', ',')}</span>
                            ${save > 0 ? `<span class="text-xs font-semibold text-green-300 mt-0.5">✔ Economize R$ ${save.toFixed(2).replace('.', ',')}</span>` : ''}
                        </div>
                        <button onclick="window.open('${ebook.checkout_url}', '_blank')" class="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors shadow-lg shadow-blue-900/40">
                            <i data-lucide="shopping-cart"></i>
                        </button>
                    </div>
                            <button onclick="openEbookPopup(${JSON.stringify(ebook).replace(/"/g,'&quot;')})" class="w-full mt-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors">
                                Saiba mais
                            </button>
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
            ov.className = 'fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm items-center justify-center p-4 overflow-y-auto';
            ov.style.display = 'none';
            ov.addEventListener('click', (ev) => { if (ev.target === ov) closeEbookPopup(); });
            document.body.appendChild(ov);
            const css = document.createElement('style');
            css.textContent = `
#ebook-popup-overlay .pd-popup-content{font-size:.9rem;line-height:1.7;color:#cbd5e1;overflow-y:auto;max-height:min(38vh,220px);padding-right:8px}
#ebook-popup-overlay .pd-popup-content h1,#ebook-popup-overlay .pd-popup-content h2,#ebook-popup-overlay .pd-popup-content h3,#ebook-popup-overlay .pd-popup-content h4{color:#f1f5f9;font-weight:800;margin:1em 0 .35em;line-height:1.3}
#ebook-popup-overlay .pd-popup-content h1{font-size:1.2rem}#ebook-popup-overlay .pd-popup-content h2{font-size:1.05rem}#ebook-popup-overlay .pd-popup-content h3,#ebook-popup-overlay .pd-popup-content h4{font-size:.95rem}
#ebook-popup-overlay .pd-popup-content h1:first-child,#ebook-popup-overlay .pd-popup-content h2:first-child{margin-top:0}
#ebook-popup-overlay .pd-popup-content p{margin:.45em 0}
#ebook-popup-overlay .pd-popup-content ul{margin:.45em 0;padding-left:1.3em;list-style:disc}
#ebook-popup-overlay .pd-popup-content li{margin:.18em 0}
#ebook-popup-overlay .pd-popup-content hr{border:none;border-top:1px dashed #334155;margin:.9em 0}
#ebook-popup-overlay .pd-popup-content strong{color:#fbbf24}
#ebook-popup-overlay .pd-popup-content code{background:#1e293b;padding:.1em .4em;border-radius:4px;font-size:.85em;color:#7dd3fc}`;
            document.head.appendChild(css);
        }

        const r = Math.min(5, Math.max(0, Math.round(Number(e.rating) || 0)));
        const stars = Array.from({length:5}, (_, i) =>
            `<i data-lucide="star" class="w-4 h-4 ${i < r ? 'fill-amber-400 text-amber-400' : 'fill-gray-700 text-gray-700'}"></i>`).join('');
        const save = (e.old_price && e.old_price > e.new_price) ? e.old_price - e.new_price : 0;
        const d = e.old_price ? Math.round((1 - e.new_price / e.old_price) * 100) : 0;

        ov.innerHTML = `
        <div class="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col sm:flex-row overflow-hidden my-auto">
            <button onclick="closeEbookPopup()" class="absolute top-3 right-3 z-10 bg-gray-800 hover:bg-gray-700 text-gray-400 w-9 h-9 rounded-full text-lg font-bold" aria-label="Fechar">✕</button>
            <div class="sm:w-60 shrink-0">
                <img src="${e.cover_url || 'https://via.placeholder.com/300x400?text=Capa'}" class="w-full aspect-[3/4] object-cover" alt="${escP(e.title)}">
            </div>
            <div class="p-6 flex-1">
                <h2 class="text-xl font-black text-white mb-1 pr-8">${escP(e.title)}</h2>
                ${r > 0 ? `<div class="flex gap-0.5 mb-3">${stars}</div>` : ''}
                <div class="flex items-center gap-2 mb-4 flex-wrap">
                    ${e.old_price ? `<span class="text-sm text-gray-500 line-through">R$ ${e.old_price.toFixed(2).replace('.', ',')}</span>` : ''}
                    <span class="text-3xl font-black text-green-400">R$ ${e.new_price.toFixed(2).replace('.', ',')}</span>
                    ${d > 0 ? `<span class="text-xs font-bold bg-green-500/20 text-green-300 px-2 py-1 rounded">-${d}%</span>` : ''}
                    ${save > 0 ? `<span class="basis-full text-xs font-semibold text-green-300">✔ Economize R$ ${save.toFixed(2).replace('.', ',')}</span>` : ''}
                </div>
                <div class="grid grid-cols-3 gap-2 text-[.68rem] text-gray-400 mb-4 pt-4 border-t border-gray-700">
                    <span>🔒 Compra segura</span>
                    <span>⚡ Entrega automática</span>
                    <span>✅ Produto original</span>
                </div>
                <a href="${e.checkout_url || '#'}" target="_blank" class="block w-full text-center py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40 mb-4">COMPRAR AGORA</a>
                ${(e.video_url || e.audio_url) ? `<button id="pm-preview" onclick="showPopupMedia()" class="block w-full text-center py-3 mb-4 bg-purple-600/90 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors text-sm">${e.video_url ? '▶ Ver prévia (vídeo)' : '🎧 Ouvir prévia (áudio)'}</button>` : ''}
                <div id="pm-player" style="display:none">
                    <button onclick="hidePopupMedia()" class="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold px-4 py-2 rounded-lg mb-4">← Voltar</button>
                    <div id="pm-player-body"></div>
                </div>
                <div class="pd-popup-content" id="pm-desc">${mdToP(e.full_description || e.short_description || '')}</div>
            </div>
        </div>`;
        ov.style.display = 'flex';
        _pmCurrent = e;
        hidePopupMedia();
        lucide.createIcons();
    }

    function closeEbookPopup() {
        const ov = document.getElementById('ebook-popup-overlay');
        if (ov) ov.style.display = 'none';
        destroyHls();
    }

    // ================================================================
    // PLAYER NO POPUP (vídeo/áudio com botão voltar)
    // ================================================================
    let _hlsInstance = null;
    let _pmCurrent = null;
    function destroyHls() {
        if (_hlsInstance) { try { _hlsInstance.destroy(); } catch (err) {} _hlsInstance = null; }
    }
    function loadHlsScript() {
        return new Promise((resolve) => {
            if (window.Hls) return resolve();
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
            s.onload = () => resolve();
            document.head.appendChild(s);
        });
    }
    function addPopupMedia(bodyEl, e) {
        bodyEl.innerHTML = '';
        if (e.video_url) {
            const v = document.createElement('video');
            v.controls = true;
            v.controlsList = 'nodownload';
            bodyEl.appendChild(v);
            if (e.video_url.includes('.m3u8')) {
                loadHlsScript().then(() => {
                    if (window.Hls && Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(e.video_url);
                        hls.attachMedia(v);
                        _hlsInstance = hls;
                    } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
                        v.src = e.video_url;
                    }
                });
            } else {
                v.src = e.video_url;
            }
        } else {
            const a = document.createElement('audio');
            a.controls = true;
            a.src = e.audio_url;
            bodyEl.appendChild(a);
        }
    }
    function showPopupMedia() {
        const e = _pmCurrent;
        if (!e || (!e.video_url && !e.audio_url)) return;
        document.getElementById('pm-desc').style.display = 'none';
        document.getElementById('pm-player').style.display = 'block';
        addPopupMedia(document.getElementById('pm-player-body'), e);
    }
    function hidePopupMedia() {
        destroyHls();
        const bodyEl = document.getElementById('pm-player-body');
        if (bodyEl) bodyEl.innerHTML = '';
        const pl = document.getElementById('pm-player');
        if (pl) pl.style.display = 'none';
        const desc = document.getElementById('pm-desc');
        if (desc) desc.style.display = '';
    }

    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeEbookPopup(); } });

    // 5. Category Filtering Logic
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // Update UI
            document.querySelectorAll('.cat-btn').forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white');
                b.classList.add('text-gray-300', 'hover:bg-gray-700');
            });
            this.classList.add('bg-blue-600', 'text-white');
            this.classList.remove('text-gray-300', 'hover:bg-gray-700');

            activeCategory = this.getAttribute('data-category');
            document.getElementById('section-title').innerText = activeCategory === 'Todos' ? 'Nossa Coleção' : activeCategory;

            fetchEbooks();

            // Close mobile menu if open
            document.getElementById('mobile-menu').classList.add('hidden');
        });
    });

    // 6. Mobile Menu Toggle
    document.querySelector('.mobile-menu-btn').addEventListener('click', function () {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });

    // Initialize
    fetchSettings();
    renderFeatured();
    fetchEbooks();
    lucide.createIcons();
});
