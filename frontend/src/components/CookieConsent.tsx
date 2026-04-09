import { useState, useEffect } from 'react';
import { X, Cookie, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';

export function CookieConsent() {
  const { data } = useData();
  const c = data.content || {};
  const [visible, setVisible] = useState(false);

  const enabled = c['cookie.enabled'] !== '0';
  const btnLabel = c['cookie.btn_label'] || 'Aceitar';
  const text    = c['cookie.text'] || 'Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade.';
  const pc      = data.settings?.primary_color || '#f97316';

  useEffect(() => {
    if (!enabled) return;
    const accepted = localStorage.getItem('cookie_accepted');
    if (!accepted) setTimeout(() => setVisible(true), 1000);
  }, [enabled]);

  const accept = () => {
    localStorage.setItem('cookie_accepted', '1');
    setVisible(false);
  };

  if (!visible || !enabled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9998] max-w-2xl mx-auto">
      <div className="bg-[#1d1d1f] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-2xl"
        style={{ border: '1px solid rgba(255,255,255,.1)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${pc}20` }}>
          <Cookie className="w-4 h-4" style={{ color: pc }} />
        </div>
        <p className="text-white/70 text-xs leading-relaxed flex-1">
          {text}{' '}
          <Link to="/privacidade" className="underline hover:text-white transition">
            Política de Privacidade
          </Link>
        </p>
        <button onClick={accept}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-white text-xs font-bold transition hover:scale-105"
          style={{ background: pc }}>
          {btnLabel}
        </button>
        <button onClick={accept}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
