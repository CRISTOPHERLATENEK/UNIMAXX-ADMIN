import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function ScrollProgress() {
  const { data } = useData();
  const pc = data.settings?.primary_color || '#f97316';
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop]   = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
      setShowTop(scrolled > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* Progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999,
        height: 3, width: `${progress}%`,
        background: `linear-gradient(90deg, ${pc}, ${pc}aa)`,
        transition: 'width 0.1s linear',
        boxShadow: `0 0 8px ${pc}60`,
        pointerEvents: 'none',
      }} />

      {/* Back to top */}
      <button
        onClick={scrollTop}
        aria-label="Voltar ao topo"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9998,
          width: 48, height: 48, borderRadius: '50%',
          background: pc,
          boxShadow: `0 4px 20px ${pc}50`,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          opacity: showTop ? 1 : 0,
          transform: showTop ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.8)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: showTop ? 'auto' : 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'; }}>
        <ChevronUp style={{ width: 22, height: 22 }} />
      </button>
    </>
  );
}
