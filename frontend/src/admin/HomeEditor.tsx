// src/admin/HomeEditor.tsx — Editor unificado da Home (Conteúdo + Layout + Banners)

import { useState } from 'react';
import { MonitorUp, Layout, Image } from 'lucide-react';
import { HomeManager } from './HomeManager';
import { PageLayoutManager } from './PageLayoutManager';
import { BannersManager } from './BannersManager';

type Tab = 'conteudo' | 'layout' | 'banners';

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'conteudo', label: 'Conteúdo',         icon: MonitorUp, desc: 'Textos, fotos e blocos da home' },
  { id: 'layout',   label: 'Layout',            icon: Layout,    desc: 'Ordem e visibilidade das seções' },
  { id: 'banners',  label: 'Banners / Carrossel', icon: Image,   desc: 'Imagens e CTAs do topo' },
];

export function HomeEditor() {
  const [tab, setTab] = useState<Tab>('conteudo');

  return (
    <div className="max-w-[1300px] mx-auto space-y-5">

      {/* Cabeçalho */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500 mb-1">Página Inicial</p>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Editor da Home
        </h1>
        <p className="text-sm text-gray-400 mt-1">Gerencie todo o conteúdo da página inicial em um só lugar.</p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 p-1 rounded-2xl border border-gray-100 bg-gray-50 w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
              style={{
                background: active ? '#fff' : 'transparent',
                color: active ? '#f97316' : '#6b7280',
                boxShadow: active ? '0 1px 6px rgba(0,0,0,.08)' : 'none',
              }}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Descrição da aba ativa */}
      <p className="text-[12px] text-gray-400 -mt-2">
        {TABS.find(t => t.id === tab)?.desc}
      </p>

      {/* Conteúdo da aba */}
      <div>
        {tab === 'conteudo' && <HomeManager />}
        {tab === 'layout'   && <PageLayoutManager />}
        {tab === 'banners'  && <BannersManager />}
      </div>
    </div>
  );
}
