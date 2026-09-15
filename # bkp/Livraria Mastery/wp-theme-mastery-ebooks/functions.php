<?php
/**
 * Mastery Ebooks functions and definitions
 */

function mastery_ebooks_scripts() {
    // Tailwind CDN
    wp_enqueue_style('tailwind', 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
    
    // Main Theme Style
    wp_enqueue_style('mastery-ebooks-style', get_stylesheet_uri());

    // Lucide Icons
    wp_enqueue_script('lucide', 'https://unpkg.com/lucide@latest', array(), null, true);
    
    // Supabase JS
    wp_enqueue_script('supabase-js', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', array(), null, true);

    // Custom JS
    wp_enqueue_script('mastery-ebooks-main', get_template_directory_uri() . '/assets/js/main.js', array('supabase-js', 'lucide'), null, true);
    
    // Pass Supabase Config to JS
    wp_localize_script('mastery-ebooks-main', 'supabaseConfig', array(
        'url' => 'https://mhajqbhykwejmkowhxdz.supabase.co',
        'key' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oYWpxYmh5a3dlam1rb3doeGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NTQ1ODksImV4cCI6MjA4NzEzMDU4OX0.JkLvLyEMuwT_zSPavbTmafq33T2DDTl4VLiTKkjVCog'
    ));
}
add_action('wp_enqueue_scripts', 'mastery_ebooks_scripts');

function mastery_ebooks_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'mastery_ebooks_setup');
