import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Footer = () => {
    const [settings, setSettings] = useState({
        address: 'Carregando...',
        phone: 'Carregando...',
        email: 'Carregando...'
    });

    useEffect(() => {
        async function fetchSettings() {
            const { data } = await supabase.from('site_settings').select('address, phone, email').single();
            if (data) setSettings(data);
        }
        fetchSettings();
    }, []);

    return (
        <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6">
                            MASTERY EBOOKS
                        </h3>
                        <p className="mb-6 max-w-md">
                            Sua fonte premium de conhecimento digital. Transforme sua vida hoje com nossos ebooks especializados em saúde e bem-estar.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-blue-400 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-pink-400 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-blue-300 transition-colors"><Twitter size={20} /></a>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contato</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <MapPin size={20} className="text-blue-500 shrink-0" />
                                <span>{settings.address}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone size={20} className="text-blue-500 shrink-0" />
                                <span>{settings.phone}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail size={20} className="text-blue-500 shrink-0" />
                                <span>{settings.email}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Links Úteis</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Suporte</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-900 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Mastery Ebooks. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
