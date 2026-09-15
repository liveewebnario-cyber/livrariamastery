<?php
/**
 * Theme Ebooks Functions
 */

function theme_ebooks_scripts()
{
    // Tailwind CSS 3.4
    wp_enqueue_style('tailwind', 'https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css');

    // Google Fonts - Inter
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    // Main Style
    wp_enqueue_style('theme-style', get_stylesheet_uri());
    wp_enqueue_style('main-css', get_template_directory_uri() . '/assets/css/main.css');

    // Supabase JS SDK
    wp_enqueue_script('supabase-sdk', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', array(), '2.0', true);

    // Lucide Icons
    wp_enqueue_script('lucide-icons', 'https://unpkg.com/lucide@latest', array(), null, true);

    // Theme Scripts
    wp_enqueue_script('theme-config', get_template_directory_uri() . '/assets/js/config.js', array(), null, true);
    wp_enqueue_script('theme-banner', get_template_directory_uri() . '/assets/js/banner.js', array('lucide-icons'), null, true);
    wp_enqueue_script('theme-app', get_template_directory_uri() . '/assets/js/app.js', array('supabase-sdk', 'theme-config', 'theme-banner'), null, true);
}
add_action('wp_enqueue_scripts', 'theme_ebooks_scripts');

function theme_ebooks_setup()
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'theme_ebooks_setup');
