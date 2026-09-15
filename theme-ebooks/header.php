<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<nav id="header-nav" class="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
                <a href="<?php echo esc_url(home_url('/')); ?>" id="site-logo-link">
                    <span id="site-logo-container" class="text-2xl font-bold text-gray-900">
                        <!-- Logo injected by app.js -->
                        CARREGANDO...
                    </span>
                </a>
            </div>

            <!-- Desktop Menu -->
            <div class="hidden md:block">
                <div id="desktop-menu" class="ml-10 flex items-baseline space-x-6">
                    <!-- Categories injected by app.js -->
                </div>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden flex items-center">
                <button id="mobile-menu-toggle" class="p-2 rounded-md text-gray-600 hover:bg-gray-50">
                    <i data-lucide="menu"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden md:hidden bg-white border-b border-gray-100 animate-fade-in">
        <div id="mobile-menu-container" class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <!-- Categories injected by app.js -->
        </div>
    </div>
</nav>
<div id="banner-wrapper" class="w-full">
    <!-- Banner Section (Global) -->
    <div id="main-banner" class="relative w-full h-80 md:h-[450px] overflow-hidden bg-gray-100">
        <div id="banner-container" class="flex transition-transform duration-700 h-full">
            <!-- Slides injected by banner.js -->
        </div>
        
        <!-- Navigation Controls -->
        <div class="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
            <button id="prev-btn" class="p-2 rounded-full bg-white/80 text-gray-800 pointer-events-auto hover:bg-white transition-colors shadow-lg shadow-black/5">
                <i data-lucide="chevron-left"></i>
            </button>
            <button id="next-btn" class="p-2 rounded-full bg-white/80 text-gray-800 pointer-events-auto hover:bg-white transition-colors shadow-lg shadow-black/5">
                <i data-lucide="chevron-right"></i>
            </button>
        </div>

        <!-- Dots -->
        <div id="banner-dots" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            <!-- Dots injected by banner.js -->
        </div>
    </div>
</div>
