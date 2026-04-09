// Hook que registra pageviews automaticamente
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Gera/recupera session_id por sessão do browser
function getSessionId(): string {
  const key = '_unimaxx_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export function useTracker() {
  const location = useLocation();

  useEffect(() => {
    // Não rastreia rotas do admin
    if (location.pathname.startsWith('/admin')) return;

    const payload = {
      page: location.pathname,
      referrer: document.referrer || '',
      session_id: getSessionId(),
    };

    fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {}); // silencioso — nunca quebra o site
  }, [location.pathname]);
}
