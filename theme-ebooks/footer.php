<footer class="bg-indigo-950 text-indigo-200 py-16 border-t border-indigo-900 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
            <!-- Brand -->
            <div class="col-span-1 md:col-span-2">
                <h3 id="footer-site-name" class="text-2xl font-bold text-white mb-6">
                    <!-- Site name injected by app.js -->
                </h3>
                <p id="footer-text-content" class="mb-6 max-w-md opacity-80">
                    <!-- Site footer text injected by app.js -->
                </p>
                <div class="flex space-x-6">
                    <a href="#" class="hover:text-amber-400 transition-smooth"><i data-lucide="facebook"></i></a>
                    <a href="#" class="hover:text-amber-400 transition-smooth"><i data-lucide="instagram"></i></a>
                    <a href="#" class="hover:text-amber-400 transition-smooth"><i data-lucide="twitter"></i></a>
                </div>
            </div>

            <!-- Contact -->
            <div>
                <h4 class="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contato</h4>
                <ul class="space-y-4">
                    <li class="flex items-start space-x-3">
                        <i data-lucide="map-pin" class="text-indigo-400 shrink-0 w-5"></i>
                        <span id="footer-address" class="text-sm">Carregando...</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <i data-lucide="phone" class="text-indigo-400 shrink-0 w-5"></i>
                        <span id="footer-phone" class="text-sm">Carregando...</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <i data-lucide="mail" class="text-indigo-400 shrink-0 w-5"></i>
                        <span id="footer-email" class="text-sm">Carregando...</span>
                    </li>
                </ul>
            </div>

            <!-- Links -->
            <div>
                <h4 class="text-white font-bold mb-6 uppercase tracking-wider text-sm">Institucional</h4>
                <ul class="space-y-3 text-sm">
                    <li><a href="#" class="hover:text-white transition-smooth">Quem Somos</a></li>
                    <li><a href="#" class="hover:text-white transition-smooth">Política de Privacidade</a></li>
                    <li><a href="#" class="hover:text-white transition-smooth">Termos de Uso</a></li>
                    <li><a href="#" class="hover:text-white transition-smooth">Ajuda & Suporte</a></li>
                </ul>
            </div>
        </div>
        
        <div class="mt-16 pt-8 border-t border-indigo-900 text-center text-xs opacity-50">
            <p id="footer-copyright">&copy; <?php echo date('Y'); ?> Mastery Ebooks. Todos os direitos reservados.</p>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
