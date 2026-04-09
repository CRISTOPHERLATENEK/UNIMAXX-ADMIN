import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noIndex?: boolean;
}

export function SEO({ title, description, keywords, ogImage, ogType = 'website', canonical, noIndex }: SEOProps) {
  useEffect(() => {
    if (title) document.title = title;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, 'property');
      setMeta('twitter:description', description);
    }
    if (keywords) setMeta('keywords', keywords);
    if (title) {
      setMeta('og:title', title, 'property');
      setMeta('twitter:title', title);
    }
    if (ogImage) {
      setMeta('og:image', ogImage, 'property');
      setMeta('twitter:image', ogImage);
    }
    if (ogType) setMeta('og:type', ogType, 'property');
    if (noIndex) setMeta('robots', 'noindex,nofollow');

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, keywords, ogImage, ogType, canonical, noIndex]);

  return null;
}

export default SEO;
