import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, LogIn, Users, Clock, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      toast.error('Email ou senha inválidos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">

      {/* Painel esquerdo — identidade visual (mesma cor da sidebar) */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-400 to-emerald-400 text-blue-900 p-2.5 rounded-xl shadow-lg">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-4H5v-2h4V7h2v4h4v2h-4v4z" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-black text-white tracking-tight">PSF Kelé</span>
            <span className="text-[11px] font-medium text-blue-300 tracking-widest uppercase">Ala Central</span>
          </div>
        </div>

        {/* Texto central */}
        <div>
          <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Gerenciamento<br />de Filas
          </h2>
          <p className="text-blue-300 text-base leading-relaxed max-w-xs">
            Organize atendimentos, reduza esperas e acompanhe a fila em tempo real.
          </p>

          {/* Features */}
          <div className="mt-10 flex flex-col gap-4">
            {[
              { icon: Users, text: 'Cadastro rápido de pacientes' },
              { icon: Clock, text: 'Fila ao vivo atualizada automaticamente' },
              { icon: ShieldCheck, text: 'Controle de prioridade e urgência' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-blue-200 text-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-300" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-500 text-xs">© 2026 ACE Faculdade — PSF Central</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-sm">

          {/* Logo mobile (só aparece em telas pequenas) */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="bg-gradient-to-br from-blue-400 to-emerald-400 text-blue-900 p-2 rounded-xl shadow">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-4H5v-2h4V7h2v4h4v2h-4v4z" />
              </svg>
            </div>
            <span className="text-xl font-black text-blue-900">PSF Kelé</span>
          </div>

          {/* Cabeçalho do form */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-800">Bem-vindo de volta</h1>
            <p className="text-slate-500 mt-1 text-sm">Faça login para acessar o painel</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleEntrar} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Usuário / Matrícula
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full bg-blue-900 hover:bg-blue-950 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}