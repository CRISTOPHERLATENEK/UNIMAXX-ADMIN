import { useState } from 'react';
import type React from 'react';

import { Plus, Pencil, Trash2, Star, Eye, EyeOff, X, Save, Upload } from 'lucide-react';
import { ImageUploadField, SPECS } from '@/components/ImageUploadField';
import { useData } from '@/context/DataContext';
import { toast } from 'sonner';
import type { Testimonial } from '@/types';

const empty = (): Partial<Testimonial> => ({
  author_name: '', author_role: '', author_company: '', author_photo: '',
  content: '', rating: 5, order_num: 0, active: 1,
});

export function TestimonialsManager() {
  const { data, saveTestimonial, deleteTestimonial, uploadImage } = useData();
  const testimonials = [...(data.testimonials || [])].sort((a, b) => a.order_num - b.order_num);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const BASE_URL = API_URL.replace('/api', '');
  const imgSrc = (img: string) => img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '';

  const handleSave = async () => {
    if (!editing?.author_name || !editing?.content) { toast.error('Nome e depoimento são obrigatórios'); return; }
    setSaving(true);
    try {
      await saveTestimonial(editing);
      toast.success(editing.id ? 'Depoimento atualizado!' : 'Depoimento adicionado!');
      setEditing(null);
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este depoimento?')) return;
    try { await deleteTestimonial(id); toast.success('Removido!'); }
    catch { toast.error('Erro ao remover'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file); setEditing((prev) => ({ ...prev, author_photo: url })); toast.success('Foto enviada!'); }
    catch { toast.error('Erro no upload'); }
    finally { setUploading(false); }
  };

  const toggleActive = async (t: Testimonial) => {
    try { await saveTestimonial({ ...t, active: t.active === 1 ? 0 : 1 }); }
    catch { toast.error('Erro ao alterar status'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depoimentos</h1>
          <p className="text-sm text-gray-500 mt-1">Avaliações e depoimentos de clientes exibidos no site</p>
        </div>
        <button onClick={() => setEditing({ ...empty(), order_num: testimonials.length })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
          <Plus className="w-4 h-4" /> Adicionar Depoimento
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.length === 0 ? (
          <div className="col-span-3 py-16 text-center bg-white rounded-2xl border border-gray-100 text-gray-400">
            <p className="text-sm">Nenhum depoimento cadastrado.</p>
          </div>
        ) : testimonials.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5" fill={i < t.rating ? '#f97316' : 'none'} style={{ color: i < t.rating ? '#f97316' : '#d1d1d6' }} />
              ))}
            </div>

            {/* Content */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">"{t.content}"</p>

            {/* Author */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-gray-50">
              {imgSrc(t.author_photo) ? (
                <img src={imgSrc(t.author_photo)} alt={t.author_name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#6e6e73' }}>{t.author_name[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{t.author_name}</p>
                <p className="text-xs text-gray-400 truncate">{[t.author_role, t.author_company].filter(Boolean).join(' · ')}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button onClick={() => toggleActive(t)} className="flex items-center gap-1.5 text-xs font-medium">
                {t.active === 1
                  ? <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Ativo</span></span>
                  : <span className="flex items-center gap-1"><EyeOff className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-400">Inativo</span></span>}
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing({ ...t })} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">{editing.id ? 'Editar Depoimento' : 'Novo Depoimento'}</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Depoimento */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Depoimento *</label>
                <textarea rows={4} value={editing.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  placeholder="Escreva o depoimento do cliente..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Avaliação</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setEditing({ ...editing, rating: n })}
                      className="p-1 rounded-lg transition-colors">
                      <Star className="w-6 h-6" fill={n <= (editing.rating || 5) ? '#f97316' : 'none'}
                        style={{ color: n <= (editing.rating || 5) ? '#f97316' : '#d1d1d6' }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Author photo */}
              <div>
                <ImageUploadField
                  label="Foto do Autor (opcional)"
                  value={editing.author_photo || ''}
                  onChange={(url) => setEditing({ ...editing, author_photo: url })}
                  onUpload={async (file) => {
                    setUploading(true);
                    try { const url = await uploadImage(file); setEditing((prev) => ({ ...prev, author_photo: url })); }
                    catch { toast.error('Erro no upload'); }
                    finally { setUploading(false); }
                  }}
                  uploading={uploading}
                  spec={SPECS.testimonialPhoto}
                  height={120}
                  placeholder="Ou cole a URL da foto"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nome do Autor *</label>
                <input type="text" value={editing.author_name || ''} onChange={(e) => setEditing({ ...editing, author_name: e.target.value })}
                  placeholder="Ex: João Silva" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cargo</label>
                  <input type="text" value={editing.author_role || ''} onChange={(e) => setEditing({ ...editing, author_role: e.target.value })}
                    placeholder="Ex: Gerente de TI" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Empresa</label>
                  <input type="text" value={editing.author_company || ''} onChange={(e) => setEditing({ ...editing, author_company: e.target.value })}
                    placeholder="Ex: Riachuelo" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
