import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Featured from './components/Featured';
import EbookCard from './components/EbookCard';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEbooks() {
      setLoading(true);
      let query = supabase.from('ebooks').select('*').order('created_at', { ascending: false });

      if (activeCategory !== 'Todos') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;

      if (!error && data) {
        setEbooks(data);
      }
      setLoading(false);
    }

    fetchEbooks();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30">
      <Navbar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      <main>
        <Banner />

        <Featured />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {activeCategory === 'Todos' ? 'Nossa Coleção Completa' : activeCategory}
              </h2>
              <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
            </div>

            <p className="text-slate-400 max-w-md">
              Explore nossos ebooks selecionados. Oferecemos os melhores conteúdos para seu desenvolvimento pessoal.
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
      </main>

      <Footer />
    </div>
  );
}

export default App;
