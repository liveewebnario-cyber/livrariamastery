import { useState, useEffect } from 'react';
import { ShoppingCart, Star, BadgeCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Featured = () => {
    const [ebook, setEbook] = useState(null);

    useEffect(() => {
let mounted = true;
    supabase
        .from('ebooks')
        .select('*')
        .eq('featured', true)
        .eq('active', true)
        .limit(1)
        .then(({ data }) => {
            if (mounted && data?.[0]) setEbook(data[0]);
        })
        .catch(() => {});
    return () => { mounted = false; };
    }, []);

    if (!ebook) return null;

    const formatPrice = (price) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

    const savings = ebook.old_price && ebook.new_price && ebook.old_price > ebook.new_price
        ? ebook.old_price - ebook.new_price
        : 0;

    const discount = savings > 0
        ? Math.round((1 - ebook.new_price / ebook.old_price) * 100)
        : 0;

    const rating = Math.min(5, Math.max(0, Number(ebook.rating) || 0));

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 via-slate-900 to-purple-900/30 rounded-3xl border border-blue-800/40 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                <div className="absolute -right-16 -top-16 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="w-44 md:w-64 flex-shrink-0 relative z-10">
                    <img
                        src={ebook.cover_url || 'https://via.placeholder.com/300x400?text=Sem+Capa'}
                        alt={ebook.title}
                        className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl shadow-blue-950/50"
                    />
                </div>

                <div className="flex-1 relative z-10 text-center md:text-left">
                    <span className="inline-block bg-blue-600 text-white text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                        ⭐ Novidade destacada
                    </span>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{ebook.title}</h2>

                    {rating > 0 && (
                        <div className="flex items-center justify-center md:justify-start gap-0.5 mb-3 text-yellow-400">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
                                    className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-slate-600'}
                                />
                            ))}
                            <span className="ml-1.5 text-sm font-semibold text-slate-300">
                                {rating}{ebook.rating_count > 0 ? ` (${ebook.rating_count})` : ''}
                            </span>
                        </div>
                    )}

                    {ebook.badge && (
                        <div className="flex items-center justify-center md:justify-start gap-1.5 mb-3">
                            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                <BadgeCheck size={14} className="text-blue-400" />
                                {ebook.badge}
                            </span>
                        </div>
                    )}

                    {ebook.short_description && (
                        <p className="text-slate-300 leading-relaxed mb-5 max-w-xl mx-auto md:mx-0 line-clamp-3">
                            {ebook.short_description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                        {ebook.old_price && (
                            <span className="text-slate-400 line-through">{formatPrice(ebook.old_price)}</span>
                        )}
                        <span className="text-3xl font-extrabold text-emerald-400">{formatPrice(ebook.new_price)}</span>
                        {discount > 0 && (
                            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-sm px-3 py-1 rounded-lg">
                                -{discount}%
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <button
                            onClick={() => window.open(ebook.checkout_url, '_blank')}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-900/30 flex items-center gap-2"
                        >
                            <ShoppingCart size={18} />
                            Comprar Agora
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Featured;