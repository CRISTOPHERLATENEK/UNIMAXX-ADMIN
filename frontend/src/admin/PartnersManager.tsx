import { useState } from 'react';
import type React from 'react';

import { Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Upload } from 'lucide-react';
import { ImageUploadField, SPECS } from '@/components/ImageUploadField';
import { useData } from '@/context/DataContext';
import { toast } from 'sonner';
import type { Partner } from '@/types';

const CATEGORIES = ['parceiro', 'integração', 'bandeira', 'marketplace', 'outro'];
const empty = (): Partial<Partner> => ({ name: '', image: '', url: '', category: 'parceiro', order_num: 0, active: 1 });

export function PartnersManager() {
  const { data, savePartner, deletePartner, uploadImage } = useData();
  const partners = [...(data.partners || [])].sort((a, b) => a.order_num - b.order_num);
  const [editing, setEditing] = useState<Partial<Partner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState('todos');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const BASE_URL = API_URL.replace('/api', '');
  const imgSrc = (img: string) => img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '';

  const categories = ['todos', ...Array.from(new Set(partners.map((p) => p.category).filter(Boolean)))];
  const filtered = filterCat === 'todos' ? partners : partners.filter((p) => p.category === filterCat);

  const handleSave = async () => {
    if (!editing?.name || !editing?.image) { toast.error('Nome e imagem são obrigatórios'); return; }
    setSaving(true);
    try {
      await savePartner(editing);
      toast.success(editing.id ? 'Parceiro atualizado!' : 'Parceiro adicionado!');
      setEditing(null);
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este parceiro?')) return;
    try { await deletePartner(id); toast.success('Removido!'); }
    catch { toast.error('Erro ao remover'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file); setEditing((prev) => ({ ...prev, image: url })); toast.success('Upload realizado!'); }
    catch { toast.error('Erro no upload'); }
    finally { setUploading(false); }
  };

  const toggleActive = async (p: Partner) => {
    try { await savePartner({ ...p, active: p.active === 1 ? 0 : 1 }); }
    catch { toast.error('Erro ao alterar status'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parceiros & Integrações</h1>
          <p className="text-sm text-gray-500 mt-1">Logos de parceiros e integrações exibidos no site</p>
        </div>
        <button onClick={() => setEditing({ ...empty(), order_num: partners.length })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
          <Plus className="w-4 h-4" /> Adicionar Parceiro
        </button>
      </div>

      {/* Category filter */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
              style={{
                background: filterCat === cat ? '#f97316' : '#f5f5f7',
                color: filterCat === cat ? '#fff' : '#6e6e73',
              }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-5 py-16 text-center bg-white rounded-2xl border border-gray-100 text-gray-400">
            <p className="text-sm">Nenhum parceiro cadastrado.</p>
          </div>
        ) : filtered.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-3 group"
            style={{ opacity: p.active === 1 ? 1 : 0.5 }}>
            {imgSrc(p.image) ? (
              <img src={imgSrc(p.image)} alt={p.name} style={{ height: 32, maxWidth: 100, objectFit: 'contain' }} />
            ) : (
              <div style={{ height: 32, width: 80, background: '#f5f5f7', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-xs text-gray-400">Sem logo</span>
              </div>
            )}
            <p className="text-xs font-semibold text-gray-700 text-center truncate w-full">{p.name}</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
              style={{ background: '#f5f5f7', color: '#6e6e73' }}>{p.category}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => toggleActive(p)} className="p-1 rounded text-gray-300 hover:text-orange-400 transition-colors">
                {p.active === 1 ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setEditing({ ...p })} className="p-1 rounded text-gray-300 hover:text-orange-500 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing.id ? 'Editar Parceiro' : 'Novo Parceiro'}</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <ImageUploadField
                  label="Logo/Imagem *"
                  value={editing.image || ''}
                  onChange={(url) => setEditing({ ...editing, image: url })}
                  onUpload={async (file) => {
                    setUploading(true);
                    try { const url = await uploadImage(file); setEditing((prev) => ({ ...prev, image: url })); }
                    catch { toast.error('Erro no upload'); }
                    finally { setUploading(false); }
                  }}
                  uploading={uploading}
                  spec={SPECS.partnerLogo}
                  height={110}
                  placeholder="Ou cole a URL do logo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nome *</label>
                <input type="text" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Ex: Visa" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categoria</label>
                <select value={editing.category || 'parceiro'} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 capitalize">
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Link (opcional)</label>
                <input type="url" value={editing.url || ''} onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  placeholder="https://www.parceiro.com" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ordem</label>
                  <input type="number" value={editing.order_num ?? 0} onChange={(e) => setEditing({ ...editing, order_num: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                  <select value={editing.active ?? 1} onChange={(e) => setEditing({ ...editing, active: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option value={1}>Ativo</option>
                    <option value={0}>Inativo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', opacity: saving ? 0.7 : 1 }}>
                <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
