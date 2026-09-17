import { useState, useEffect } from 'react';
import EbookCard from './EbookCard';
import { supabase } from '../lib/supabase';

const ThemeShelves = ({ onView }) => {
    const [shelves, setShelves] = useState([]);

    useEffect(() => {
        let mounted = true;
        supabase
            .from('ebooks')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(60)
            .then(({ data }) => {
                if (!mounted || !data) return;
                const books = data;
                const disc = (o, n) => o ? Math.round((1 - n / o) * 100) : 0;
                const ofertas = books
                    .filter((e) => e.old_price && e.new_price && e.old_price > e.new_price)
                    .sort((a, b) => disc(b.old_price, b.new_price) - disc(a.old_price, a.new_price));
                const lancamentos = books.slice(0, 4);
                const top = books
                    .filter((e) => Number(e.rating) > 0)
                    .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
                setShelves([
                    { key: 'ofertas', title: '🔥 Ofertas da Semana', items: ofertas },
                    { key: 'lancamentos', title: '🆕 Lançamentos', items: lancamentos },
                    { key: 'top', title: '⭐ Mais Avaliados', items: top },
                ]);
            })
            .catch(() => {});
        return () => { mounted = false; };
    }, []);

    if (!shelves.some((s) => s.items.length)) return null;

    return (
        <>
            {shelves.map((s) => s.items.length ? (
                <div key={s.key} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
                    <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
                        <div>
                            <h3 className="text-2xl font-bold text-white">{s.title}</h3>
                            <div className="h-1 w-20 bg-blue-600 rounded-full mt-2"></div>
                        </div>
                        <button
                            onClick={() => onView(s.key)}
                            className="text-blue-400 hover:text-blue-300 font-semibold text-sm"
                        >
                            Ver lista completa →
                        </button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {s.items.slice(0, 4).map((ebook) => (
                            <EbookCard key={ebook.id} ebook={ebook} />
                        ))}
                    </div>
                </div>
            )) : null}
        </>
    );
};

export default ThemeShelves;