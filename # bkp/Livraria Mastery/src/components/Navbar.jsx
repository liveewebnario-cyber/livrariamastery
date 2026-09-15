import { useState, useEffect } from 'react';
import { Menu, X, Search, ShoppingCart, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = ({ activeCategory, setActiveCategory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({ logo_url: '' });
    const [categories, setCategories] = useState([
        'Todos', 'Saúde da Mulher', 'Saúde do Homem', 'Bem Estar', 'Sexualidade'
    ]);

    useEffect(() => {
        async function fetchSettings() {
            const { data } = await supabase.from('site_settings').select('logo_url').single();
            if (data) setSettings(data);
        }
        fetchSettings();
    }, []);

    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setActiveCategory('Todos')}>
                        {settings.logo_url ? (
                            <img className="h-10 w-auto" src={settings.logo_url} alt="Logo" />
                        ) : (
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                MASTERY EBOOKS
                            </span>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeCategory === cat
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button className="text-slate-300 hover:text-white p-2">
                            <Search size={20} />
                        </button>
                        <button className="text-slate-300 hover:text-white p-2">
                            <ShoppingCart size={20} />
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setActiveCategory(cat);
                                    setIsOpen(false);
                                }}
                                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeCategory === cat
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
