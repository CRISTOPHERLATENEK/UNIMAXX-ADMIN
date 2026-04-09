import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Initializes scroll-based animations for elements with data-reveal and data-stagger attributes.
 * Also adds tilt effects, magnetic buttons, and parallax scrolling.
 * Re-initializes on route change.
 */
export function useScrollAnimations() {
  const location = useLocation();

  useEffect(() => {
    // Run at multiple delays to catch sections that render after API loads
    const t1 = setTimeout(init, 120);
    const t2 = setTimeout(init, 600);
    const t3 = setTimeout(init, 1400);
    const t4 = setTimeout(init, 2500);

    // Also watch for new [data-reveal] elements added after API fetch
    const mutationObserver = new MutationObserver(() => {
      const unseen = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.revealed), [data-stagger]:not(.revealed)');
      if (unseen.length > 0) init();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      mutationObserver.disconnect();
    };
  }, [location.pathname]);

  function init() {
    // ── Reveal on scroll ──────────────────────────────────────────────────────
    const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.revealed), [data-stagger]:not(.revealed)');

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );

    revealEls.forEach((el) => {
      // If already in viewport on page load, reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        el.classList.add('revealed');
      } else {
        revealObserver.observe(el);
      }
    });

    // ── Tilt 3D effect on cards ───────────────────────────────────────────────
    const tiltEls = document.querySelectorAll<HTMLElement>('.tilt-card');

    const handleTiltMove = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotY = ((x - cx) / cx) * 8;
      const rotX = -((y - cy) / cy) * 6;
      el.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    };

    const handleTiltLeave = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    };

    tiltEls.forEach((el) => {
      el.addEventListener('mousemove', handleTiltMove as EventListener);
      el.addEventListener('mouseleave', handleTiltLeave as EventListener);
    });

    // ── Magnetic button effect ────────────────────────────────────────────────
    const magnetEls = document.querySelectorAll<HTMLElement>('.btn-magnetic');

    const handleMagnetMove = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    };

    const handleMagnetLeave = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = 'translate(0, 0)';
    };

    magnetEls.forEach((el) => {
      el.addEventListener('mousemove', handleMagnetMove as EventListener);
      el.addEventListener('mouseleave', handleMagnetLeave as EventListener);
    });

    // ── Ripple mouse tracking ─────────────────────────────────────────────────
    const rippleEls = document.querySelectorAll<HTMLElement>('.ripple-btn');

    const handleRipple = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--rx', `${x}%`);
      el.style.setProperty('--ry', `${y}%`);
    };

    rippleEls.forEach((el) => {
      el.addEventListener('mousemove', handleRipple as EventListener);
    });

    // ── Parallax on scroll ────────────────────────────────────────────────────
    const handleParallax = () => {
      const parallaxEls = document.querySelectorAll<HTMLElement>('.parallax-img img');
      parallaxEls.forEach((img) => {
        const wrapper = img.closest('.parallax-img') as HTMLElement;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh - rect.top) / (vh + rect.height);
        const offset = (progress - 0.5) * 40;
        img.style.transform = `scale(1.12) translateY(${offset}px)`;
      });
    };

    window.addEventListener('scroll', handleParallax, { passive: true });
    handleParallax();

    return () => {
      revealObserver.disconnect();
      tiltEls.forEach((el) => {
        el.removeEventListener('mousemove', handleTiltMove as EventListener);
        el.removeEventListener('mouseleave', handleTiltLeave as EventListener);
      });
      magnetEls.forEach((el) => {
        el.removeEventListener('mousemove', handleMagnetMove as EventListener);
        el.removeEventListener('mouseleave', handleMagnetLeave as EventListener);
      });
      rippleEls.forEach((el) => {
        el.removeEventListener('mousemove', handleRipple as EventListener);
      });
      window.removeEventListener('scroll', handleParallax);
    };
  }
}
