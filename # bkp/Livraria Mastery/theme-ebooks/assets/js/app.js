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
        grid.innerHTML = ebooks.map(ebook => `
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
                    <h3 class="text-lg font-bold text-gray-900 mb-4 line-clamp-2 h-14" title="${ebook.title}">${ebook.title}</h3>
                    
                    <div class="mt-auto">
                        <div class="mb-4">
                            ${ebook.old_price ? `<span class="line-through-price text-xs">de R$ ${ebook.old_price.toFixed(2)}</span>` : ''}
                            <div class="text-2xl font-black text-indigo-700">Por R$ ${ebook.new_price.toFixed(2)}</div>
                        </div>
                        
                        <a href="${ebook.checkout_url}" target="_blank" class="block w-full text-center py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                            COMPRAR AGORA
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }

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
