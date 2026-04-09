import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';

export function AnnouncementPopup() {
  const { data } = useData();
  const c = data.content || {};
  const [visible, setVisible] = useState(false);

  const enabled   = c['popup.enabled']   === '1';
  const title     = c['popup.title']     || '';
  const text      = c['popup.text']      || '';
  const ctaLabel  = c['popup.cta_label'] || 'Saiba mais';
  const ctaLink   = c['popup.cta_link']  || '/solucoes';
  const pc        = data.settings?.primary_color || '#f97316';
  const sc        = data.settings?.secondary_color || '#fb923c';

  useEffect(() => {
    if (!enabled) return;
    const dismissed = sessionStorage.getItem('popup_dismissed');
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
  }, [enabled]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('popup_dismissed', '1');
  };

  if (!visible || !enabled || !text) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header gradient */}
        <div className="h-2" style={{ background: `linear-gradient(to right, ${pc}, ${sc})` }} />

        <div className="p-8">
          <button onClick={dismiss}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#98989d] hover:text-[#1d1d1f] hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: `${pc}12` }}>
            <span className="text-2xl">✨</span>
          </div>

          {title && (
            <h2 className="text-xl font-bold text-[#1d1d1f] mb-3"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
              {title}
            </h2>
          )}

          <p className="text-[#6e6e73] leading-relaxed mb-6 text-sm">{text}</p>

          <div className="flex items-center gap-3">
            {ctaLink.startsWith('http') ? (
              <a href={ctaLink} target="_blank" rel="noreferrer" onClick={dismiss}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm transition hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${pc}, ${sc})`, boxShadow: `0 8px 24px ${pc}35` }}>
                {ctaLabel} <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <Link to={ctaLink} onClick={dismiss}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm transition hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${pc}, ${sc})`, boxShadow: `0 8px 24px ${pc}35` }}>
                {ctaLabel} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <button onClick={dismiss}
              className="px-4 py-3 rounded-2xl text-sm text-[#98989d] hover:text-[#1d1d1f] hover:bg-gray-100 transition font-medium">
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
