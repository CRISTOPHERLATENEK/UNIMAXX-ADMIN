// Hero.tsx — renderiza APENAS o que estiver cadastrado no admin.
// Sem nenhum texto, cor ou fallback hardcoded.
// Se não houver banners cadastrados e ativos, não renderiza nada.

import { PageBanner } from '@/components/PageBanner';

export function Hero() {
  return <PageBanner page="home" />;
}
