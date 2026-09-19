import { useState } from 'react';
import { supabase } from '../lib/supabase';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState({ text: '', ok: true });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const value = email.trim().toLowerCase();
        if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
            setMsg({ text: 'Digite um e-mail válido.', ok: false });
            return;
        }
        setBusy(true);
        try {
            const { error } = await supabase.from('newsletters').insert({ email: value, name: name.trim() || null });
            if (error) {
                setMsg({
                    text: error.code === '23505' ? 'Este e-mail já está cadastrado. 😉' : 'Erro ao cadastrar. Tente novamente.',
                    ok: error.code === '23505',
                });
            } else {
                setMsg({ text: '✅ E-mail cadastrado com sucesso!', ok: true });
                setEmail('');
                setName('');
            }
        } catch {
            setMsg({ text: 'Erro ao cadastrar. Tente novamente.', ok: false });
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="px-4 pb-16">
            <div className="max-w-3xl mx-auto text-center p-10 rounded-3xl bg-gradient-to-br from-blue-900/30 via-slate-900 to-purple-900/30 border border-blue-800/40">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">📬 Quer receber nossas novidades?</h2>
                <p className="text-slate-400 mb-6">Lançamentos, ofertas e conteúdos exclusivos direto no seu e-mail. É gratuito!</p>
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 max-w-md mx-auto">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome (opcional)"
                        className="flex-1 min-w-[180px] px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Seu melhor e-mail"
                        required
                        className="flex-1 min-w-[220px] px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={busy}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-60"
                    >
                        {busy ? 'Cadastrando...' : 'Quero receber novidades'}
                    </button>
                </form>
                {msg.text && (
                    <p className={`mt-4 text-sm font-semibold ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>
                )}
            </div>
        </section>
    );
};

export default Newsletter;