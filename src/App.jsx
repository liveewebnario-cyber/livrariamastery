import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Featured from './components/Featured';
import ThemeShelves from './components/ThemeShelves';
import Newsletter from './components/Newsletter';
import EbookCard from './components/EbookCard';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const VIEW_TITLES = {
    ofertas: '🔥 Ofertas da Semana',
    lancamentos: '🆕 Lançamentos',
    top: '⭐ Mais Avaliados',
};

function App() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [view, setView] = useState('Todos');
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEbooks() {
      setLoading(true);

      if (view === 'Todos') {
        let query = supabase.from('ebooks').select('*').order('created_at', { ascending: false });
        if (activeCategory !== 'Todos') query = query.eq('category', activeCategory);
        const { data, error } = await query;
        if (!error && data) setEbooks(data);
      } else {
        const { data, error } = await supabase
            .from('ebooks').select('*').eq('active', true)
            .order('created_at', { ascending: false }).limit(60);
        if (!error && data) {
            const disc = (o, n) => o ? Math.round((1 - n / o) * 100) : 0;
            let list = data;
            if (view === 'ofertas') {
                list = data
                    .filter((e) => e.old_price && e.new_price && e.old_price > e.new_price)
                    .sort((a, b) => disc(b.old_price, b.new_price) - disc(a.old_price, a.new_price));
            } else if (view === 'top') {
                list = data
                    .filter((e) => Number(e.rating) > 0)
                    .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
            } else {
                list = data.slice(0, 4);
            }
            setEbooks(list);
        }
      }

      setLoading(false);
    }

    fetchEbooks();
  }, [activeCategory, view]);

  const gridTitle = view !== 'Todos'
    ? VIEW_TITLES[view]
    : (activeCategory === 'Todos' ? 'Nossa Coleção Completa' : activeCategory);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30">
      <Navbar activeCategory={activeCategory} setActiveCategory={(c) => { setView('Todos'); setActiveCategory(c); }} />

      <main>
        <Banner />

        <Featured />

        {view === 'Todos' && (
          <ThemeShelves onView={setView} />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {gridTitle}
              </h2>
              <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
            </div>

            <p className="text-slate-400 max-w-md">
              {view !== 'Todos'
                ? 'Seleção completa dos melhores ebooks desta lista.'
                : 'Explore nossos ebooks selecionados. Oferecemos os melhores conteúdos para seu desenvolvimento pessoal.'}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {ebooks.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  <AnimatePresence mode="popLayout">
                    {ebooks.map((ebook) => (
                      <EbookCard key={ebook.id} ebook={ebook} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                  <p className="text-slate-500 text-lg">Nenhum ebook encontrado nesta categoria.</p>
                  <button
                    onClick={() => setActiveCategory('Todos')}
                    className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Ver todos os ebooks
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      <Newsletter />
      </main>

      <Footer />
    </div>
  );
}

export default App;
