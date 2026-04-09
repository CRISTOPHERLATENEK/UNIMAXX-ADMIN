import type { SolutionPage } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchSolutionPages(): Promise<SolutionPage[]> {
  const res = await fetch(`${API_URL}/solution-pages`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Erro ${res.status} ao buscar soluções`);
  }
  return res.json();
}

export async function fetchSolutionPageBySlug(slug: string): Promise<SolutionPage> {
  const res = await fetch(`${API_URL}/solution-pages/${encodeURIComponent(slug)}`);
  if (res.status === 404) throw new Error('Página de solução não encontrada');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Erro ${res.status} ao buscar solução`);
  }
  const data = await res.json();
  // Garantir que blocks_json seja sempre array
  const parseArr = (v: any): any[] => {
    if (!v) return [];
    try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return []; }
  };
  return { ...data, blocks_json: parseArr(data.blocks_json) };
}
