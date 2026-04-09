import { useState } from 'react';
import type React from 'react';

import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fundo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#f97316]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#f97316]/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[380px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#f97316] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-orange-500/30">
            <span className="text-white font-black text-2xl leading-none">U</span>
          </div>
          <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
          <p className="text-white/40 text-sm mt-1">Unimaxx — Gestão de Conteúdo</p>
        </div>

        {/* Formulário */}
        <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-7 backdrop-blur-sm">
          {error && (
            <Alert variant="destructive" className="mb-5 bg-red-500/10 border-red-500/20 text-red-400">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white/60 text-xs font-semibold uppercase tracking-wider">E-mail</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@unimaxx.com.br"
                  className="pl-10 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[#f97316]/50 focus:ring-[#f97316]/20 h-11"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Senha</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[#f97316]/50 focus:ring-[#f97316]/20 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#f97316] hover:bg-[#ea6c00] text-white font-bold h-11 mt-2 shadow-lg shadow-orange-500/20 transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : 'Entrar no Painel'}
            </Button>
          </form>
        </div>

        {/* Voltar */}
        <div className="text-center mt-6">
          <a href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors flex items-center justify-center gap-1.5">
            ← Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
}
