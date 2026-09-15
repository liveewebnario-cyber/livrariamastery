<?php get_header(); ?>

<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-12">
        <div>
            <h1 id="category-title" class="text-3xl font-bold text-gray-900 border-l-4 border-indigo-600 pl-4">
                Nossa Coleção
            </h1>
        </div>
        <div id="ebook-count" class="text-gray-500 mt-4 md:mt-0 italic">
            Carregando produtos...
        </div>
    </div>

    <!-- Ebook Grid -->
    <div id="ebook-grid" class="ebook-grid">
        <!-- Grid Skeleton -->
        <?php for ($i = 0; $i < 4; $i++): ?>
            <div class="animate-pulse bg-gray-200 rounded-2xl h-96"></div>
        <?php
endfor; ?>
    </div>

    <!-- Empty State -->
    <div id="empty-state" class="hidden text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 mt-8">
        <div class="text-gray-300 mb-4">
            <i data-lucide="book-x" size="48" class="mx-auto"></i>
        </div>
        <p class="text-xl text-gray-500">Ops! Nenhum ebook encontrado aqui.</p>
        <button id="reset-filter" class="mt-4 text-indigo-600 font-semibold hover:underline">Ver todos os ebooks</button>
    </div>
</main>

<?php get_footer(); ?>
