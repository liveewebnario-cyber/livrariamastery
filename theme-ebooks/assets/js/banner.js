/**
 * Banner Slider - PRD v1.0
 */

class BannerSlider {
    constructor() {
        this.container = document.getElementById('banner-container');
        this.dotsContainer = document.getElementById('banner-dots');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.currentIndex = 0;
        this.banners = [];
        this.interval = null;
    }

    init(banners) {
        if (!banners || banners.length === 0) {
            document.getElementById('main-banner').classList.add('hidden');
            return;
        }

        this.banners = banners;
        this.render();
        this.startAutoPlay();
        this.setupEventListeners();
    }

    render() {
        // Render Slides
        this.container.innerHTML = this.banners.map(banner => `
            <div class="min-w-full h-full relative">
                <img src="${banner.image_url}" class="w-full h-full object-cover" alt="${banner.title || ''}">
                <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-gray-900/80 to-transparent">
                    <h2 class="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">${banner.title || ''}</h2>
                    <p class="text-lg md:text-xl text-gray-200 drop-shadow-md">${banner.subtitle || ''}</p>
                    ${banner.link_url ? `<a href="${banner.link_url}" class="mt-6 px-8 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-indigo-600 hover:text-white transition-colors">Saiba Mais</a>` : ''}
                </div>
            </div>
        `).join('');

        // Render Dots
        this.dotsContainer.innerHTML = this.banners.map((_, i) => `
            <button class="w-3 h-3 rounded-full transition-all duration-300 ${i === 0 ? 'bg-indigo-600 w-8' : 'bg-white/50'}" data-index="${i}"></button>
        `).join('');
    }

    setupEventListeners() {
        this.nextBtn?.addEventListener('click', () => this.next());
        this.prevBtn?.addEventListener('click', () => this.prev());

        this.dotsContainer?.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.goTo(index);
            });
        });
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.banners.length;
        this.updatePosition();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length;
        this.updatePosition();
    }

    goTo(index) {
        this.currentIndex = index;
        this.updatePosition();
    }

    updatePosition() {
        this.container.style.transform = `translateX(-${this.currentIndex * 100}%)`;

        // Update Dots
        const dots = this.dotsContainer?.querySelectorAll('button');
        dots?.forEach((dot, i) => {
            if (i === this.currentIndex) {
                dot.classList.add('bg-indigo-600', 'w-8');
                dot.classList.remove('bg-white/50');
            } else {
                dot.classList.remove('bg-indigo-600', 'w-8');
                dot.classList.add('bg-white/50');
            }
        });

        // Reset Autoplay timer on manual change
        this.startAutoPlay();
    }

    startAutoPlay() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.next(), 5000);
    }
}

window.BannerSlider = new BannerSlider();
