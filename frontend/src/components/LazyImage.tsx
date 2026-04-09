import { useState, useRef, useEffect } from 'react';

// Inject shimmer keyframe once — <style> inline no JSX causa insertBefore crash
if (typeof document !== 'undefined' && !document.getElementById('lazy-shimmer-style')) {
  const _s = document.createElement('style');
  _s.id = 'lazy-shimmer-style';
  _s.textContent = '@keyframes lazyShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }';
  document.head.appendChild(_s);
}


interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string;
  skeletonClass?: string;
}

export function LazyImage({ src, alt, aspectRatio, skeletonClass, style, className, ...props }: LazyImageProps) {
  const [loaded, setLoaded]     = useState(false);
  const [inView, setInView]     = useState(false);
  const [error, setError]       = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: '200px' }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', ...(aspectRatio ? { aspectRatio } : {}), overflow: 'hidden' }}>
      {/* Skeleton */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'lazyShimmer 1.5s infinite',
        }} />
      )}
      {/* Actual image */}
      {inView && !error && (
        <img src={src} alt={alt}
          loading="lazy" decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            ...style,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          className={className}
          {...props}
        />
      )}
    </div>
  );
}
