import { Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1d1d1f] flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto text-center">

        {/* 404 */}
        <div
          className="text-[160px] font-black leading-none tracking-tighter mb-4"
          style={{
            background: 'linear-gradient(135deg, #ffffff20 0%, #ff6b00 50%, #ffffff15 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          404
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Página não encontrada
        </h1>
        <p className="text-white/50 mb-10 leading-relaxed">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/25"
          >
            <Home className="w-4 h-4" />
            Ir para a Home
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-14 pt-8 border-t border-white/8">
          <p className="text-white/30 text-xs uppercase tracking-wider mb-4">Páginas populares</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Soluções', to: '/solucoes' },
              { label: 'Segmentos', to: '/segmentos' },
              { label: 'Sobre Nós', to: '/sobre' },
              { label: 'Suporte', to: '/suporte' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 bg-white/5 text-white/60 hover:bg-orange-500/20 hover:text-orange-400 rounded-full text-sm transition-all border border-white/5 hover:border-orange-500/30"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
