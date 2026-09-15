<?php
/**
 * Ebooks Store Theme - Functions
 */

// Suporte a features do WP
function ebooks_store_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'gallery', 'caption']);
    add_theme_support('customize-selective-refresh-widgets');

    register_nav_menus(['primary' => __('Menu Principal', 'ebooks-store')]);
}
add_action('after_setup_theme', 'ebooks_store_setup');

// Enqueue scripts e styles
function ebooks_store_scripts() {
    // Google Fonts
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', [], null);

    // CSS principal
    wp_enqueue_style('ebooks-store-style', get_template_directory_uri() . '/style.css', [], '1.0.0');
    wp_enqueue_style('ebooks-store-main', get_template_directory_uri() . '/assets/css/main.css', ['ebooks-store-style'], '1.0.0');

    // Supabase SDK
    wp_enqueue_script('supabase-sdk', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js', [], '2.0', false);

    // Config e App
    wp_enqueue_script('ebooks-config', get_template_directory_uri() . '/assets/js/config.js', ['supabase-sdk'], '1.0.0', false);
    wp_enqueue_script('ebooks-app', get_template_directory_uri() . '/assets/js/app.js', ['ebooks-config'], '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'ebooks_store_scripts');

// Remover barra do admin para visitantes
function ebooks_remove_admin_bar() {
    if (!current_user_can('administrator')) {
        show_admin_bar(false);
    }
}
add_action('after_setup_theme', 'ebooks_remove_admin_bar');
?>
