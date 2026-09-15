import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';

const EbookCard = ({ ebook }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
        >
            {/* Cover Image */}
            <div className="relative aspect-[3/4] overflow-hidden">
                <img
                    src={ebook.cover_url || 'https://via.placeholder.com/300x400?text=Sem+Capa'}
                    alt={ebook.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Hover Overlay - Mini Description */}
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-white">
                    <p className="text-sm line-clamp-4 mb-4 text-slate-300">
                        {ebook.description}
                    </p>
                    <div className="flex space-x-2">
                        <button
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
                            onClick={() => window.open(ebook.checkout_url, '_blank')}
                        >
                            <Eye size={16} />
                            <span>Ver Mais</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{ebook.title}</h3>
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">{ebook.category}</p>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        {ebook.price_old && (
                            <span className="text-sm text-slate-500 line-through">
                                {formatPrice(ebook.price_old)}
                            </span>
                        )}
                        <span className="text-xl font-bold text-emerald-400">
                            {formatPrice(ebook.price_new)}
                        </span>
                    </div>

                    <button
                        onClick={() => window.open(ebook.checkout_url, '_blank')}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default EbookCard;
