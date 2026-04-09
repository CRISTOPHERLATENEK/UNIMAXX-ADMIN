import { useState, useEffect } from 'react';
import type React from 'react';

import {
  Plus, Edit2, Trash2, Search, Upload, EyeOff,
  Save, X, AlertCircle, CheckCircle2, Loader
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

interface HelpCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order_position: number;
}

interface HelpArticle {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  youtube_url: string;
  order_position: number;
  status: number;
  views: number;
  category_name?: string;
}

interface HelpImage {
  id: number;
  article_id: number;
  image_path: string;
  alt_text: string;
  order_position: number;
}

const ICON_OPTIONS = [
  'BookOpen', 'Settings', 'DollarSign', 'Zap', 'HelpCircle', 'Users',
  'FileText', 'Monitor', 'Package', 'Star', 'Globe', 'Building2',
];

export function HelpCenterManager() {
  const [activeTab, setActiveTab] = useState<'categories' | 'articles'>('categories');
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [images, setImages] = useState<HelpImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState<Partial<HelpCategory>>({});
  const [articleForm, setArticleForm] = useState<Partial<HelpArticle>>({});
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const token = localStorage.getItem('token');
  const authHeader = () => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/help/categories`, { headers: authHeader() });
      if (res.ok) setCategories(await res.json());
    } catch { toast.error('Erro ao buscar categorias'); }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/help/articles`, { headers: authHeader() });
      if (res.ok) setArticles(await res.json());
    } catch { toast.error('Erro ao buscar artigos'); }
  };

  const fetchImages = async (articleId: number) => {
    try {
      const res = await fetch(`${API_URL}/admin/help/articles/${articleId}/images`, { headers: authHeader() });
      if (res.ok) setImages(await res.json());
    } catch { toast.error('Erro ao buscar imagens'); }
  };

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  // ── Categorias ─────────────────────────────────────────────────────────────

  const handleSaveCategory = async () => {
    if (!categoryForm.name?.trim()) { toast.error('Nome da categoria é obrigatório'); return; }
    setLoading(true);
    try {
      const method = categoryForm.id ? 'PUT' : 'POST';
      const url = categoryForm.id
        ? `${API_URL}/admin/help/categories/${categoryForm.id}`
        : `${API_URL}/admin/help/categories`;
      const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(categoryForm) });
      if (res.ok) {
        toast.success(categoryForm.id ? 'Categoria atualizada' : 'Categoria criada');
        setCategoryForm({});
        setShowCategoryModal(false);
        fetchCategories();
      } else {
        let msg = 'Erro ao salvar categoria';
        try { const err = await res.json(); msg = err.error || msg; } catch {}
        toast.error(msg);
        console.error('Save category error:', res.status, msg);
      }
    } catch (e) { console.error(e); toast.error('Erro de conexão ao salvar categoria'); }
    finally { setLoading(false); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Tem certeza? Todos os artigos desta categoria serão deletados.')) return;
    try {
      const res = await fetch(`${API_URL}/admin/help/categories/${id}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) { toast.success('Categoria deletada'); fetchCategories(); fetchArticles(); }
      else toast.error('Erro ao deletar categoria');
    } catch { toast.error('Erro ao deletar categoria'); }
  };

  // ── Artigos ────────────────────────────────────────────────────────────────

  const handleSaveArticle = async () => {
    if (!articleForm.category_id || !articleForm.title?.trim()) {
      toast.error('Categoria e título são obrigatórios'); return;
    }
    setLoading(true);
    try {
      const method = articleForm.id ? 'PUT' : 'POST';
      const url = articleForm.id
        ? `${API_URL}/admin/help/articles/${articleForm.id}`
        : `${API_URL}/admin/help/articles`;
      const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(articleForm) });
      if (res.ok) {
        toast.success(articleForm.id ? 'Artigo atualizado' : 'Artigo criado');
        setArticleForm({});
        setShowArticleModal(false);
        fetchArticles();
      } else {
        let msg = 'Erro ao salvar artigo';
        try { const err = await res.json(); msg = err.error || msg; } catch {}
        toast.error(msg);
        console.error('Save article error:', res.status, msg);
      }
    } catch (e) { console.error(e); toast.error('Erro de conexão ao salvar artigo'); }
    finally { setLoading(false); }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita.')) return;
    try {
      const res = await fetch(`${API_URL}/admin/help/articles/${id}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) { toast.success('Artigo deletado'); fetchArticles(); }
      else toast.error('Erro ao deletar artigo');
    } catch { toast.error('Erro ao deletar artigo'); }
  };

  const handleToggleArticleStatus = async (article: HelpArticle) => {
    try {
      const res = await fetch(`${API_URL}/admin/help/articles/${article.id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ ...article, status: article.status === 1 ? 0 : 1 }),
      });
      if (res.ok) { toast.success('Status atualizado'); fetchArticles(); }
      else toast.error('Erro ao atualizar status');
    } catch { toast.error('Erro ao atualizar status'); }
  };

  // ── Imagens ────────────────────────────────────────────────────────────────

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedArticleId || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt_text', '');
    setUploadingImage(true);
    try {
      const res = await fetch(`${API_URL}/admin/help/articles/${selectedArticleId}/images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) { toast.success('Imagem enviada'); fetchImages(selectedArticleId); e.target.value = ''; }
      else toast.error('Erro ao enviar imagem');
    } catch { toast.error('Erro ao enviar imagem'); }
    finally { setUploadingImage(false); }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm('Remover imagem?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/help/images/${id}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) { toast.success('Imagem removida'); if (selectedArticleId) fetchImages(selectedArticleId); }
      else toast.error('Erro ao deletar imagem');
    } catch { toast.error('Erro ao deletar imagem'); }
  };

  // ── Filtros ────────────────────────────────────────────────────────────────

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Ajuda</h1>
          <p className="text-gray-600 mt-1">Gerencie categorias, artigos e tutoriais</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['categories', 'articles'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'categories' ? 'Categorias' : 'Artigos'}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder={activeTab === 'categories' ? 'Buscar categorias...' : 'Buscar artigos...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            if (activeTab === 'categories') {
              setCategoryForm({ icon: 'HelpCircle' });
              setShowCategoryModal(true);
            } else {
              setArticleForm({ status: 1 });
              setShowArticleModal(true);
            }
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus size={18} className="mr-2" />
          {activeTab === 'categories' ? 'Nova Categoria' : 'Novo Artigo'}
        </Button>
      </div>

      {/* ── Tab: Categorias ── */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {filteredCategories.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">Nenhuma categoria encontrada</p>
            </Card>
          ) : filteredCategories.map(category => (
            <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                      {category.icon}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                  <p className="text-xs text-gray-400 mt-1">slug: {category.slug} · posição: {category.order_position}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => { setCategoryForm(category); setShowCategoryModal(true); }}>
                    <Edit2 size={15} />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Tab: Artigos ── */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">Nenhum artigo encontrado</p>
            </Card>
          ) : filteredArticles.map(article => (
            <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">{article.title}</h3>
                    {article.status === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        <CheckCircle2 size={11} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        <EyeOff size={11} /> Inativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{article.short_description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Categoria: <strong className="text-gray-600">{article.category_name}</strong></span>
                    <span>Visualizações: {article.views}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <Button variant="outline" size="sm" title="Gerenciar imagens"
                    onClick={() => { setSelectedArticleId(article.id); fetchImages(article.id); setShowImagesModal(true); }}>
                    <Upload size={15} />
                  </Button>
                  <Button variant="outline" size="sm" title={(article.status === 1) ? 'Desativar' : 'Ativar'}
                    onClick={() => handleToggleArticleStatus(article)}>
                    {article.status === 1 ? <EyeOff size={15} /> : <CheckCircle2 size={15} />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setArticleForm(article); setShowArticleModal(true); }}>
                    <Edit2 size={15} />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteArticle(article.id)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ══ Modal: Categoria ══════════════════════════════════════════════════ */}
      <Dialog open={showCategoryModal} onOpenChange={(open) => { if (!open) { setShowCategoryModal(false); setCategoryForm({}); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle><span style={{ display: (categoryForm.id) ? 'inline' : 'none' }}>Editar Categoria</span><span style={{ display: (categoryForm.id) ? 'none' : 'inline' }}>Nova Categoria</span></DialogTitle>
            <DialogDescription>Preencha os dados da categoria.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <Input
                value={categoryForm.name || ''}
                onChange={(e) => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Financeiro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <Textarea
                value={categoryForm.description || ''}
                onChange={(e) => setCategoryForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Breve descrição da categoria"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
              <select
                value={categoryForm.icon || 'HelpCircle'}
                onChange={(e) => setCategoryForm(f => ({ ...f, icon: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posição</label>
              <Input
                type="number"
                value={categoryForm.order_position ?? 0}
                onChange={(e) => setCategoryForm(f => ({ ...f, order_position: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              {/* Wrap icon in stable span to avoid Portal insertBefore crash */}
              <Button onClick={handleSaveCategory} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin" size={15} style={{ display: loading ? 'block' : 'none' }} />
                  <Save size={15} style={{ display: loading ? 'none' : 'block' }} />
                  Salvar
                </span>
              </Button>
              <Button onClick={() => { setShowCategoryModal(false); setCategoryForm({}); }} variant="outline" className="flex-1">
                <X size={15} className="mr-2" /> Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ Modal: Artigo ════════════════════════════════════════════════════ */}
      <Dialog open={showArticleModal} onOpenChange={(open) => { if (!open) { setShowArticleModal(false); setArticleForm({}); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle><span style={{ display: (articleForm.id) ? 'inline' : 'none' }}>Editar Artigo</span><span style={{ display: (articleForm.id) ? 'none' : 'inline' }}>Novo Artigo</span></DialogTitle>
            <DialogDescription>Preencha os dados do artigo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                value={articleForm.category_id || ''}
                onChange={(e) => setArticleForm(f => ({ ...f, category_id: parseInt(e.target.value) || undefined }))}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <Input
                value={articleForm.title || ''}
                onChange={(e) => setArticleForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Título do artigo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta</label>
              <Textarea
                value={articleForm.short_description || ''}
                onChange={(e) => setArticleForm(f => ({ ...f, short_description: e.target.value }))}
                placeholder="Resumo do artigo (aparece na listagem)"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo
                <span className="ml-2 text-xs font-normal text-gray-400">Suporta HTML (ex: &lt;b&gt;, &lt;br&gt;, &lt;ul&gt;&lt;li&gt;...)</span>
              </label>
              <Textarea
                value={articleForm.content || ''}
                onChange={(e) => setArticleForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Conteúdo completo. Use HTML para formatação."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link do YouTube (opcional)</label>
              <Input
                value={articleForm.youtube_url || ''}
                onChange={(e) => setArticleForm(f => ({ ...f, youtube_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
              />
              <p className="text-xs text-gray-400 mt-1">Cole a URL normal do YouTube — o sistema converte automaticamente.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Posição</label>
                <Input
                  type="number"
                  value={articleForm.order_position ?? 0}
                  onChange={(e) => setArticleForm(f => ({ ...f, order_position: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={articleForm.status ?? 1}
                  onChange={(e) => setArticleForm(f => ({ ...f, status: parseInt(e.target.value) }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveArticle} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin" size={15} style={{ display: loading ? 'block' : 'none' }} />
                  <Save size={15} style={{ display: loading ? 'none' : 'block' }} />
                  Salvar
                </span>
              </Button>
              <Button onClick={() => { setShowArticleModal(false); setArticleForm({}); }} variant="outline" className="flex-1">
                <X size={15} className="mr-2" /> Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ Modal: Imagens ═══════════════════════════════════════════════════ */}
      <Dialog open={showImagesModal} onOpenChange={(open) => { if (!open) { setShowImagesModal(false); setImages([]); setSelectedArticleId(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Imagens do Artigo</DialogTitle>
            <DialogDescription>Adicione imagens explicativas ao artigo. Elas aparecem abaixo do conteúdo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <label
              htmlFor="help-image-upload"
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
                uploadingImage ? 'border-orange-300 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              <Loader className="animate-spin text-orange-500 mb-2" size={28} style={{ display: uploadingImage ? 'block' : 'none' }} />
              <Upload className="text-gray-400 mb-2" size={28} style={{ display: uploadingImage ? 'none' : 'block' }} />
              <p className="text-sm text-gray-600 font-medium">
                <span style={{ display: (uploadingImage) ? 'inline' : 'none' }}>Enviando...</span><span style={{ display: (uploadingImage) ? 'none' : 'inline' }}>Clique para adicionar imagem</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP até 10MB</p>
              <input
                id="help-image-upload"
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {images.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">Nenhuma imagem cadastrada</p>
              ) : images.map(img => {
                const src = img.image_path.startsWith('http') ? img.image_path : `${BASE_URL}${img.image_path}`;
                return (
                  <div key={img.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <img src={src} alt={img.alt_text || 'imagem'} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{img.image_path.split('/').pop()}</p>
                      {img.alt_text && <p className="text-xs text-gray-500 truncate">{img.alt_text}</p>}
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 flex-shrink-0" onClick={() => handleDeleteImage(img.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button onClick={() => setShowImagesModal(false)} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
