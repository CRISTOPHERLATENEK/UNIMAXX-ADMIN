import { useState } from 'react';
import type React from 'react';

import { Plus, Pencil, Trash2, GripVertical, Check, Link2, Eye, EyeOff, Navigation, ChevronRight, LayoutGrid, Upload, FileEdit } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';
import type { Solution } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const iconOptions = [
  'Building2', 'Monitor', 'ShoppingCart', 'CreditCard',
  'Truck', 'BarChart3', 'Smartphone', 'Globe', 'Settings', 'Zap',
];

// Estrutura real do Header — espelho do que está em Header.tsx
const HEADER_NAV = [
  {
    group: 'Soluções',
    icon: 'LayoutGrid',
    items: [
      { label: 'Todas as Soluções', to: '/solucoes' },
    ],
    note: 'Página dinâmica — cada solução aparece automaticamente no dropdown do Header',
  },
  {
    group: 'Segmentos',
    icon: 'Tags',
    items: [
      { label: 'Todos os Segmentos', to: '/segmentos' },
    ],
  },
  {
    group: 'Institucional',
    icon: 'Building2',
    items: [
      { label: 'Sobre Nós', to: '/sobre' },
      { label: 'Carreiras', to: '/carreiras' },
      { label: 'Imprensa', to: '/imprensa' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    group: 'Suporte',
    icon: 'HelpCircle',
    items: [
      { label: 'Central de Ajuda', to: '/suporte' },
      { label: 'Área do Cliente', to: '/cliente' },
    ],
  },
];

type EditingSolution = Solution;

export function SolutionsManager() {
  const { data, updateSolution, deleteSolution, uploadImage } = useData();
  const navigate = useNavigate();
  const [editingSolution, setEditingSolution] = useState<EditingSolution | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
  const resolveImg = (img?: string) => !img ? null : img.startsWith('http') ? img : `${API_BASE}${img}`;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSolution) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setEditingSolution({ ...editingSolution, image: url });
      toast({ title: 'Upload realizado!' });
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editingSolution) return;
    try {
      await updateSolution(editingSolution);
      setIsDialogOpen(false);
      setEditingSolution(null);
      toast({ title: 'Sucesso!', description: 'Solução salva com sucesso.' });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar solução.', variant: 'destructive' });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSolution(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta solução?')) return;
    try {
      await deleteSolution(id);
      toast({ title: 'Excluído', description: 'Solução removida.' });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (solution: Solution) => {
    try {
      await updateSolution({ ...solution, active: solution.active === 1 ? 0 : 1 });
      toast({ title: solution.active === 1 ? 'Desativada' : 'Ativada', description: solution.title });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível alterar.', variant: 'destructive' });
    }
  };

  const handleAddFeature = () => {
    if (!editingSolution) return;
    setEditingSolution({ ...editingSolution, features: [...editingSolution.features, ''] });
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingSolution) return;
    setEditingSolution({ ...editingSolution, features: editingSolution.features.filter((_, i) => i !== index) });
  };

  const handleFeatureChange = (index: number, value: string) => {
    if (!editingSolution) return;
    const newFeatures = [...editingSolution.features];
    newFeatures[index] = value;
    setEditingSolution({ ...editingSolution, features: newFeatures });
  };

  const openNewSolution = () => {
    setEditingSolution({
      id: '',
      solution_id: `solution-${Date.now()}`,
      title: '',
      description: '',
      features: [''],
      cta_text: 'Saiba mais',
      icon: 'Building2',
      order_num: data.solutions.length,
      active: 1,
      nav_link: '',
    });
    setIsDialogOpen(true);
  };

  const openEditSolution = (solution: Solution) => {
    setEditingSolution({ ...solution, nav_link: solution.nav_link ?? '' });
    setIsDialogOpen(true);
  };

  const activeSolutions = data.solutions.filter(s => s.active === 1).length;
  const isEditing = !!(editingSolution?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const filteredSolutions = data.solutions
    .sort((a, b) => a.order_num - b.order_num)
    .filter(s => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredSolutions.length / PAGE_SIZE);
  const pagedSolutions = filteredSolutions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Soluções</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {activeSolutions} de {data.solutions.length} soluções ativas no site
          </p>
        </div>
        <Button onClick={openNewSolution} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Nova Solução
        </Button>
      </div>

      {/* Info */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <Link2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Links de navegação</p>
          <p className="text-xs text-amber-700 mt-1">
            Ao editar uma solução, defina o <strong>Link no Menu</strong> para controlar para onde
            o usuário vai ao clicar nela no Header. Padrão: <code>/solucao/[id]</code>.
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar soluções por nome ou descrição..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        />
        <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs">✕</button>
        )}
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredSolutions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">{searchQuery ? 'Nenhuma solução encontrada para a busca' : 'Nenhuma solução cadastrada ainda'}</p>
            {!searchQuery && (
              <Button onClick={openNewSolution} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                <Plus className="w-4 h-4 mr-2" /> Criar primeira solução
              </Button>
            )}
          </div>
        ) : (
          <>
          <div className="divide-y divide-gray-100">
            {pagedSolutions
              .map((solution) => {
                const navLink = solution.nav_link;
                return (
                  <div
                    key={solution.solution_id}
                    className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${solution.active === 0 ? 'opacity-50' : ''}`}
                  >
                    <GripVertical className="w-5 h-5 text-gray-300 cursor-move flex-shrink-0" />
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {resolveImg(solution.image)
                        ? <img src={resolveImg(solution.image)!} alt="" className="w-full h-full object-cover rounded-xl" />
                        : <span className="text-orange-600 font-bold text-sm">{solution.title?.[0] || 'S'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm">{solution.title}</h3>
                        {solution.active === 1
                          ? <Badge className="bg-green-100 text-green-700 border-0 text-xs">Ativo</Badge>
                          : <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">Inativo</Badge>
                        }
                        {navLink && (
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs flex items-center gap-1">
                            <Link2 className="w-2.5 h-2.5" /> {navLink}
                          </Badge>
                        )}
                        {solution.image && (
                          <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">📷 Foto</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{solution.description}</p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        ID: {solution.solution_id} · {solution.features?.length || 0} funcionalidades
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleToggleActive(solution)}
                        className={(solution.active === 1) ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}
                        title={(solution.active === 1) ? 'Desativar' : 'Ativar'}
                      >
                        {solution.active === 1 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditSolution(solution)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                        title="Editar página desta solução"
                        onClick={() => navigate(`/admin/paginas-solucoes?slug=${solution.solution_id}`)}
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span className="text-xs hidden sm:inline">Página</span>
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => handleDelete(solution.solution_id)}
                        className="text-red-500 hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {filteredSolutions.length} resultado{filteredSolutions.length !== 1 ? 's' : ''} · página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Dialog — fora da lista para evitar o bug removeChild do React DOM */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle><span style={{ display: (isEditing) ? 'inline' : 'none' }}>Editar Solução</span><span style={{ display: (isEditing) ? 'none' : 'inline' }}>Nova Solução</span></DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Edite os dados da solução e clique em Salvar.'
                : 'Preencha os dados para criar uma nova solução no site.'
              }
            </DialogDescription>
          </DialogHeader>

          {editingSolution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Título *</Label>
                  <Input
                    value={editingSolution.title}
                    onChange={(e) => setEditingSolution({ ...editingSolution, title: e.target.value })}
                    placeholder="Ex: Maxx ERP"
                  />
                </div>
                <div>
                  <Label>ID da Solução</Label>
                  <Input
                    value={editingSolution.solution_id || ''}
                    onChange={(e) => setEditingSolution({ ...editingSolution, solution_id: e.target.value })}
                    placeholder="Ex: maxx-erp"
                  />
                  <p className="text-xs text-gray-400 mt-1">URL: /solucao/maxx-erp</p>
                </div>
                <div>
                  <Label>Ícone</Label>
                  <Select
                    value={editingSolution.icon}
                    onValueChange={(v) => setEditingSolution({ ...editingSolution, icon: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <Label>Foto de Capa do Card</Label>
                <p className="text-xs text-gray-400 mb-2">Aparece como fundo do card no carousel. Se não informada, usamos um gradiente automático.</p>
                {resolveImg(editingSolution.image) && (
                  <div className="mb-2 relative rounded-xl overflow-hidden" style={{ height: 80 }}>
                    <img src={resolveImg(editingSolution.image)!} alt="preview" className="w-full h-full object-cover" />
                    <button
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs"
                      onClick={() => setEditingSolution({ ...editingSolution, image: '' })}>✕</button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-orange-300 transition-colors mb-2">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500"><span style={{ display: (uploading) ? 'inline' : 'none' }}>Enviando...</span><span style={{ display: (uploading) ? 'none' : 'inline' }}>Upload de foto (PNG/JPG/WEBP)</span></span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                <Input
                  value={editingSolution.image || ''}
                  onChange={(e) => setEditingSolution({ ...editingSolution, image: e.target.value })}
                  placeholder="Ou cole a URL da imagem"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingSolution.description}
                  onChange={(e) => setEditingSolution({ ...editingSolution, description: e.target.value })}
                  placeholder="Descrição da solução"
                  rows={3}
                />
              </div>

              {/* Nav Link — visual header picker */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <Navigation className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-gray-800 text-sm">Link no Menu de Navegação</span>
                  {editingSolution.nav_link ? (
                    <span className="ml-auto flex items-center gap-1.5 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      <Link2 className="w-3 h-3" /> {editingSolution.nav_link}
                      <button
                        type="button"
                        onClick={() => setEditingSolution({ ...editingSolution, nav_link: '' })}
                        className="ml-1 hover:text-red-600 transition-colors"
                        title="Limpar link"
                      >×</button>
                    </span>
                  ) : (
                    <span className="ml-auto text-xs text-gray-400">
                      padrão: /solucao/{editingSolution.solution_id || 'slug'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 px-4 py-2.5 bg-white border-b border-gray-100">
                  Clique em qualquer item abaixo para definir para onde o usuário será levado ao clicar nesta solução no Header.
                </p>

                {/* Mapa visual do Header */}
                <div className="divide-y divide-gray-100 bg-white">
                  {HEADER_NAV.map((group) => (
                    <div key={group.group} className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" /> {group.group}
                      </p>
                      <div className="flex flex-wrap gap-2 pl-4">
                        {group.items.map((item) => {
                          const isSelected = editingSolution.nav_link === item.to;
                          return (
                            <button
                              key={item.to}
                              type="button"
                              onClick={() => setEditingSolution({
                                ...editingSolution,
                                nav_link: isSelected ? '' : item.to
                              })}
                              className={`text-sm px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${isSelected
                                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50'
                                }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                      {group.note && (
                        <p className="text-xs text-gray-400 pl-4 mt-1.5">{group.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Texto do Botão CTA</Label>
                <Input
                  value={editingSolution.cta_text}
                  onChange={(e) => setEditingSolution({ ...editingSolution, cta_text: e.target.value })}
                  placeholder="Ex: Saiba mais"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Funcionalidades</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddFeature}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingSolution.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Funcionalidade ${index + 1}`}
                      />
                      <Button
                        type="button" variant="outline" size="icon"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:bg-red-50 flex-shrink-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleSave} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                  <Check className="w-4 h-4 mr-2" /> Salvar Solução
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
