<footer class="bg-gray-950 text-gray-400 py-12 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
            <!-- Brand -->
            <div class="col-span-1 md:col-span-2">
                <h3 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-6">
                    MASTERY EBOOKS
                </h3>
                <p class="mb-6 max-w-md">
                    Sua fonte premium de conhecimento digital. Transforme sua vida hoje com nossos ebooks especializados em saúde e bem-estar.
                </p>
                <div class="flex space-x-4">
                    <a href="#" class="hover:text-blue-400 transition-colors"><i data-lucide="facebook"></i></a>
                    <a href="#" class="hover:text-pink-400 transition-colors"><i data-lucide="instagram"></i></a>
                    <a href="#" class="hover:text-blue-300 transition-colors"><i data-lucide="twitter"></i></a>
                </div>
            </div>

            <!-- Contact -->
            <div>
                <h4 class="text-white font-bold mb-6">Contato</h4>
                <ul class="space-y-4">
                    <li class="flex items-start space-x-3">
                        <i data-lucide="map-pin" class="text-blue-500 shrink-0 w-5"></i>
                        <span id="footer-address">Carregando endereço...</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <i data-lucide="phone" class="text-blue-500 shrink-0 w-5"></i>
                        <span id="footer-phone">Carregando telefone...</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <i data-lucide="mail" class="text-blue-500 shrink-0 w-5"></i>
                        <span id="footer-email">Carregando email...</span>
                    </li>
                </ul>
            </div>

            <!-- Links -->
            <div>
                <h4 class="text-white font-bold mb-6">Links Úteis</h4>
                <ul class="space-y-3">
                    <li><a href="#" class="hover:text-white transition-colors">Sobre Nós</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Privacidade</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Termos de Uso</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Suporte</a></li>
                </ul>
            </div>
        </div>
        
        <div class="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; <?php echo date('Y'); ?> Mastery Ebooks. Todos os direitos reservados.</p>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
