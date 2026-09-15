<?php get_header(); ?>

<main class="min-h-screen">
    <!-- Rotating Banner Section -->
    <div id="hero-banner" class="relative w-full h-80 md:h-[450px] overflow-hidden bg-gray-950">
        <div id="banner-container" class="absolute inset-0 transition-opacity duration-1000">
            <!-- Banner content injected by JS -->
            <div class="flex items-center justify-center h-full">
                <div class="animate-pulse text-gray-500">Carregando banner...</div>
            </div>
        </div>
        
        <!-- Banner Controls -->
        <button id="banner-prev" class="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 hidden group-hover:block">
            <i data-lucide="chevron-left"></i>
        </button>
        <button id="banner-next" class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 hidden group-hover:block">
            <i data-lucide="chevron-right"></i>
        </button>
    </div>

    <!-- Ebooks Grid Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
                <h2 id="section-title" class="text-3xl font-bold text-white mb-2">Nossa Coleção</h2>
                <div class="h-1 w-20 bg-blue-600 rounded-full"></div>
            </div>
            <p class="text-gray-400 mt-4 md:mt-0 max-w-sm">Explore nossos melhores ebooks selecionados para você.</p>
        </div>

        <!-- 4-Column Grid -->
        <div id="ebooks-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Ebook cards injected by JS -->
            <?php for ($i = 0; $i < 4; $i++): ?>
                <div class="animate-pulse bg-gray-800 rounded-xl h-96"></div>
            <?php
endfor; ?>
        </div>

        <!-- No Results Message -->
        <div id="no-results" class="hidden text-center py-20 bg-gray-800/50 rounded-2xl border border-dashed border-gray-700 mt-8">
            <p class="text-gray-500 text-lg">Nenhum ebook encontrado nesta categoria.</p>
        </div>
    </div>
</main>

<?php get_footer(); ?>
