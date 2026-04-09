import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function WhatsAppWidget() {
  const { data } = useData();
  const settings = data.settings || {};
  const [open, setOpen] = useState(false);

  const number   = settings.whatsapp_number;
  const message  = settings.whatsapp_message || 'Olá! Gostaria de saber mais sobre as soluções Unimaxx.';
  const position = settings.whatsapp_position === 'left' ? 'left' : 'right';
  const visible = settings.whatsapp_visible !== '0';

  if (!visible || !number) return null;

  const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  const posClass = position === 'left'
    ? 'fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3'
    : 'fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3';

  return (
    <div className={posClass}>
      {/* Chat bubble */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl w-72 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: '#25d366' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">
                  {data.content?.['header.company'] || 'Unimaxx'}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                  <span className="text-white/80 text-xs">Online agora</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4" style={{ background: '#e5ddd5' }}>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm">
              <p className="text-[#1d1d1f] text-sm leading-relaxed">
                Olá! 👋 Como posso ajudar você hoje?
              </p>
              <p className="text-[#98989d] text-[10px] mt-1 text-right">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* CTA */}
          <a href={waUrl} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-sm transition-all hover:brightness-110"
            style={{ background: '#25d366' }}>
            <MessageCircle className="w-4 h-4" />
            Iniciar conversa
          </a>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{ background: '#25d366', boxShadow: '0 8px 24px rgba(37,211,102,.45)' }}
        aria-label="Abrir WhatsApp">
        {open
          ? <X className="w-6 h-6 text-white" />
          : <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.117 1.522 5.847L.057 23.743c-.069.263.163.51.432.439l5.994-1.572C8.022 23.492 9.972 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.847 0-3.588-.491-5.101-1.35l-.365-.215-3.767.988.988-3.662-.235-.376A9.934 9.934 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
        }
        {/* Pulse ring */}
        {!open && (
          <span className="absolute w-14 h-14 rounded-full animate-ping opacity-25"
            style={{ background: '#25d366' }} />
        )}
      </button>
    </div>
  );
}
