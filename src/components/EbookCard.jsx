import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, Star, X, ShieldCheck, Zap, BadgeCheck, Play, Headphones, ArrowLeft } from 'lucide-react';
import Hls from 'hls.js';

const HlsVideo = ({ src }) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || !src) return;
        if (src.includes('.m3u8')) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(el);
                return () => hls.destroy();
            } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
                el.src = src;
            }
        } else {
            el.src = src;
        }
    }, [src]);
    return <video ref={ref} controls className="w-full aspect-video bg-black rounded-xl" controlsList="nodownload" />;
};

const renderMarkdown = (text = '') => {
    if (!text) return '';
    const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = (s) => escape(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');

    const lines = text.split(/\r?\n/);
    let html = '';
    let list = [];
    const flushList = () => {
        if (list.length) {
            html += '<ul>' + list.map((l) => `<li>${inline(l)}</li>`).join('') + '</ul>';
            list = [];
        }
    };

    for (const raw of lines) {
        const line = raw.trimEnd();
        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
            flushList();
            const lvl = heading[1].length;
            html += `<h${lvl}>${inline(heading[2])}</h${lvl}>`;
            continue;
        }
        const item = line.match(/^[-*]\s+(.*)$/);
        if (item) {
            list.push(item[1]);
            continue;
        }
        if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
            flushList();
            html += '<hr/>';
            continue;
        }
        if (line.trim() === '') {
            flushList();
            continue;
        }
        flushList();
        html += `<p>${inline(line)}</p>`;
    }
    flushList();
    return html;
};

const EbookCard = ({ ebook }) => {
    const [open, setOpen] = useState(false);
    const [media, setMedia] = useState(null);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const savings = ebook.old_price && ebook.new_price && ebook.old_price > ebook.new_price
        ? ebook.old_price - ebook.new_price
        : 0;

    const discount = savings > 0
        ? Math.round((1 - ebook.new_price / ebook.old_price) * 100)
        : 0;

    const rating = Math.min(5, Math.max(0, Number(ebook.rating) || 0));
    const description = ebook.full_description || ebook.short_description || '';

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
                {/* Cover Image */}
                <div
                    className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    <img
                        src={ebook.cover_url || 'https://via.placeholder.com/300x400?text=Sem+Capa'}
                        alt={ebook.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Hover Overlay - Mini Description */}
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-white pointer-events-none">
                        <p className="text-sm line-clamp-4 mb-4 text-slate-300">
                            {ebook.short_description || description}
                        </p>
                        <button
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm pointer-events-auto"
                            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                        >
                            <Eye size={16} />
                            <span>Ver Mais</span>
                        </button>
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{ebook.title}</h3>
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">{ebook.category}</p>

                    {rating > 0 && (
                        <div className="flex items-center gap-0.5 mb-3 text-yellow-400">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={15}
                                    fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
                                    className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-slate-600'}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            {ebook.old_price && (
                                <span className="text-sm text-slate-500 line-through">
                                    {formatPrice(ebook.old_price)}
                                </span>
                            )}
                            <span className="text-xl font-bold text-emerald-400">
                                {formatPrice(ebook.new_price)}
                            </span>
                            {savings > 0 && (
                                <span className="text-xs font-semibold text-emerald-300 mt-0.5">
                                    ✔ Economize {formatPrice(savings)}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => window.open(ebook.checkout_url, '_blank')}
                                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                                title="Comprar agora"
                            >
                                <ShoppingCart size={20} />
                            </button>
                            {(ebook.video_url || ebook.audio_url) && (
                                <button
                                    onClick={() => setMedia(ebook.video_url ? 'video' : 'audio')}
                                    className="bg-purple-600/90 hover:bg-purple-500 text-white px-3 py-2 rounded-lg transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
                                    title={ebook.video_url ? 'Assistir vídeo' : 'Ouvir áudio'}
                                >
                                    {ebook.video_url ? <Play size={14} /> : <Headphones size={14} />}
                                    {ebook.video_url ? 'Vídeo' : 'Áudio'}
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(true)}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
                            >
                                Saiba mais
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── POPUP DETALHES ── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="grid md:grid-cols-[220px_1fr]">
                                {/* Capa */}
                                <div className="p-5 md:border-r md:border-slate-800">
                                    <img
                                        src={ebook.cover_url || 'https://via.placeholder.com/300x400?text=Sem+Capa'}
                                        alt={ebook.title}
                                        className="w-full aspect-[3/4] object-cover rounded-xl shadow-xl"
                                    />
                                </div>

                                {/* Conteúdo */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h2 className="text-xl font-bold text-white">{ebook.title}</h2>
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="text-slate-400 hover:text-white"
                                            aria-label="Fechar"
                                        >
                                            <X size={22} />
                                        </button>
                                    </div>

                                    {rating > 0 && (
                                        <div className="flex items-center gap-0.5 mb-3 text-yellow-400">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
                                                    className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-slate-600'}
                                                />
                                            ))}
                                            <span className="ml-2 text-sm text-slate-400">{rating.toLocaleString('pt-BR')}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        {ebook.old_price && (
                                            <span className="text-base text-slate-500 line-through">
                                                {formatPrice(ebook.old_price)}
                                            </span>
                                        )}
                                        <span className="text-2xl font-bold text-emerald-400">
                                            {formatPrice(ebook.new_price)}
                                        </span>
                                        {discount > 0 && (
                                            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md">
                                                -{discount}%
                                            </span>
                                        )}
                                        {savings > 0 && (
                                            <span className="w-full text-xs font-semibold text-emerald-300">
                                                ✔ Economize {formatPrice(savings)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-[0.7rem] text-slate-400 mb-4 pt-4 border-t border-slate-800">
                                        <span className="flex items-center gap-1.5">
                                            <ShieldCheck size={15} className="text-emerald-400" /> Compra segura
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Zap size={15} className="text-yellow-400" /> Entrega automática
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <BadgeCheck size={15} className="text-blue-400" /> Produto original
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => window.open(ebook.checkout_url, '_blank')}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 mb-4"
                                    >
                                        <ShoppingCart size={18} />
                                        Comprar agora
                                    </button>

                                    {description && (
                                        <div
                                            className="md-content max-h-64 overflow-y-auto pr-2"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        {/* ── POPUP MÍDIA (vídeo/áudio) ── */}
            <AnimatePresence>
                {media && (
                    <motion.div
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMedia(null)}
                    >
                        <motion.div
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 p-4 border-b border-slate-800">
                                <button
                                    onClick={() => setMedia(null)}
                                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Voltar
                                </button>
                                <span className="text-sm text-slate-300 truncate">{ebook.title}</span>
                            </div>
                            <div className="p-4">
                                {media === 'video'
                                    ? <HlsVideo src={ebook.video_url} />
                                    : (
                                        <div className="flex items-center justify-center py-8">
                                            <audio controls src={ebook.audio_url} className="w-full" />
                                        </div>
                                    )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EbookCard;