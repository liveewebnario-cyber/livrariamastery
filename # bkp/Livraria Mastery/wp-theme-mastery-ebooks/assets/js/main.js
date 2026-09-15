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
        grid.innerHTML = ebooks.map(ebook => `
            <div class="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <!-- Cover -->
                <div class="relative aspect-[3/4] overflow-hidden">
                    <img src="${ebook.cover_url || 'https://via.placeholder.com/300x400?text=Sem+Capa'}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="${ebook.title}">
                    
                    <!-- Hover Dropdown (Mini Description) -->
                    <div class="absolute inset-0 bg-gray-900/95 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-white">
                        <p class="text-sm line-clamp-6 mb-6 text-gray-300">${ebook.description || ''}</p>
                        <button onclick="window.open('${ebook.checkout_url}', '_blank')" class="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm font-medium transition-colors">
                            Detalhes
                        </button>
                    </div>
                </div>

                <!-- Info -->
                <div class="p-5">
                    <h3 class="text-lg font-bold text-white mb-1 line-clamp-1">${ebook.title}</h3>
                    <p class="text-xs text-gray-500 mb-4 uppercase tracking-tighter">${ebook.category}</p>
                    
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col">
                            ${ebook.price_old ? `<span class="text-sm text-gray-500 line-through">R$ ${ebook.price_old.toFixed(2).replace('.', ',')}</span>` : ''}
                            <span class="text-xl font-bold text-green-400">R$ ${ebook.price_new.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <button onclick="window.open('${ebook.checkout_url}', '_blank')" class="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors shadow-lg shadow-blue-900/40">
                            <i data-lucide="shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }

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
    fetchEbooks();
    lucide.createIcons();
});
