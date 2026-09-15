<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-gray-900 text-gray-100 font-sans'); ?>>

<nav id="main-nav" class="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
            <!-- Logo Section -->
            <div class="flex-shrink-0 flex items-center">
                <a href="<?php echo esc_url(home_url('/')); ?>" class="flex items-center">
                    <div id="site-logo">
                        <span class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                            MASTERY EBOOKS
                        </span>
                    </div>
                </a>
            </div>

            <!-- Categories / Topics Menu -->
            <div class="hidden md:block">
                <div id="category-menu" class="ml-10 flex items-baseline space-x-4">
                    <!-- Dynamic categories will be injected here -->
                    <button class="cat-btn px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white" data-category="Todos">Todos</button>
                    <button class="cat-btn px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700" data-category="Saúde da Mulher">Saúde da Mulher</button>
                    <button class="cat-btn px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700" data-category="Saúde do Homem">Saúde do Homem</button>
                    <button class="cat-btn px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700" data-category="Bem Estar">Bem Estar</button>
                    <button class="cat-btn px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700" data-category="Sexualidade">Sexualidade</button>
                </div>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden flex items-center">
                <button type="button" class="mobile-menu-btn inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                    <i data-lucide="menu"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu (Hidden by default) -->
    <div id="mobile-menu" class="hidden md:hidden bg-gray-800 border-b border-gray-700">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <button class="cat-btn block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white" data-category="Todos">Todos</button>
             <button class="cat-btn block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700" data-category="Saúde da Mulher">Saúde da Mulher</button>
             <button class="cat-btn block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700" data-category="Saúde do Homem">Saúde do Homem</button>
             <button class="cat-btn block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700" data-category="Bem Estar">Bem Estar</button>
             <button class="cat-btn block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700" data-category="Sexualidade">Sexualidade</button>
        </div>
    </div>
</nav>
