import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
    Monitor, Smartphone, Tablet, Eye, RotateCcw, RotateCw,
    Trash2, Copy, Settings, Image,
    Plus, Check, Globe, Layout as LayoutIcon, Sparkles, Zap, Box, GripVertical
} from 'lucide-react';
import { ComponentPalette } from './ComponentPalette';
import { PropertyPanel } from './PropertyPanel';
import { MediaLibrary } from '../MediaLibrary';
import { PreviewModal } from './PreviewModal';

interface ComponentData {
    id: string;
    type: string;
    props: any;
    styles: any;
}

interface PageEditorProps {
    pageId?: string;
    initialData?: any;
}

export const PageEditor: React.FC<PageEditorProps> = ({ pageId, initialData }) => {
    const [components, setComponents] = useState<ComponentData[]>(
        initialData?.layout_json || []
    );
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [history, setHistory] = useState<ComponentData[][]>([[]]);;
    const [historyIndex, setHistoryIndex] = useState(0);
    const [pageTitle, setPageTitle] = useState(initialData?.title || '');
    const [pageSlug, setPageSlug] = useState(initialData?.slug || '');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'components' | 'layers'>('components');
    const [activeDragId, setActiveDragId] = useState<string | number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        if (initialData?.layout_json) {
            setComponents(initialData.layout_json);
            setHistory([initialData.layout_json]);
        }
    }, [initialData]);

    const updateHistory = (newComponents: ComponentData[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newComponents);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setComponents(newComponents);
    };

    const addComponent = (type: string, index?: number) => {
        const templates: Record<string, any> = {
            hero: { title: 'Título Principal', subtitle: 'Subtítulo descritivo aqui', backgroundImage: '', ctaText: 'Saiba Mais', ctaLink: '#', alignment: 'center', height: '600px', overlayOpacity: 0.5, showScrollIndicator: true },
            features: { title: 'Nossos Recursos', subtitle: 'O que oferecemos de melhor', columns: 3, items: [{ icon: 'Check', title: 'Recurso 1', description: 'Descrição detalhada do recurso' }, { icon: 'Check', title: 'Recurso 2', description: 'Descrição detalhada do recurso' }, { icon: 'Check', title: 'Recurso 3', description: 'Descrição detalhada do recurso' }] },
            text: { title: 'Título da Seção', content: '<p>Conteúdo em formato rich text...</p>', alignment: 'left', maxWidth: '800px' },
            image: { src: '', alt: '', caption: '', alignment: 'center', borderRadius: '8px', shadow: 'medium' },
            gallery: { images: [], layout: 'grid', columns: 3, gap: '16px', lightbox: true },
            video: { url: '', thumbnail: '', autoplay: false, controls: true, loop: false },
            testimonials: { title: 'O que dizem nossos clientes', testimonials: [{ name: 'Cliente 1', text: 'Depoimento aqui...', role: 'Cargo', avatar: '' }], autoplay: true, interval: 5000 },
            pricing: { title: 'Nossos Planos', currency: 'R$', period: 'mês', plans: [{ name: 'Básico', price: '99', features: ['Item 1', 'Item 2'], highlighted: false }] },
            cta: { title: 'Pronto para começar?', subtitle: 'Entre em contato conosco hoje mesmo', buttonText: 'Fale Conosco', buttonLink: '/contato', style: 'default' },
            team: { title: 'Nossa Equipe', members: [{ name: 'Nome', role: 'Cargo', photo: '', bio: '', social: {} }] },
            countdown: { title: 'Oferta por tempo limitado', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), expiredText: 'Oferta encerrada', showDays: true },
            faq: { title: 'Perguntas Frequentes', items: [{ question: 'Pergunta 1?', answer: 'Resposta 1' }], allowMultiple: false },
            newsletter: { title: 'Fique por dentro', subtitle: 'Assine nossa newsletter', placeholder: 'seu@email.com', buttonText: 'Inscrever', successMessage: 'Inscrito com sucesso!' },
            map: { address: 'São Paulo, SP', zoom: 15, height: '400px', marker: true },
            divider: { style: 'line', color: '#e5e7eb', spacing: '40px' },
            spacer: { height: '40px' }
        };

        const newComponent: ComponentData = {
            id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            props: templates[type] || {},
            styles: { padding: '40px 20px', margin: '0', backgroundColor: 'transparent', backgroundImage: '', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '0', border: 'none', customCSS: '', block_style: 'fluid' }
        };

        const newComponents = [...components];
        const insertIndex = index !== undefined ? index : newComponents.length;
        newComponents.splice(insertIndex, 0, newComponent);
        updateHistory(newComponents);
        setSelectedId(newComponent.id);
    };

    const moveComponent = (fromIndex: number, toIndex: number) => {
        const newComponents = arrayMove(components, fromIndex, toIndex);
        updateHistory(newComponents);
    };

    const updateComponent = (id: string, updates: Partial<ComponentData>) => {
        const newComponents = components.map(c => c.id === id ? { ...c, ...updates } : c);
        updateHistory(newComponents);
    };

    const deleteComponent = (id: string) => {
        const newComponents = components.filter(c => c.id !== id);
        updateHistory(newComponents);
        if (selectedId === id) setSelectedId(null);
    };

    const duplicateComponent = (id: string) => {
        const component = components.find(c => c.id === id);
        if (!component) return;
        const index = components.findIndex(c => c.id === id);
        const newComponent: ComponentData = { ...component, id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, props: JSON.parse(JSON.stringify(component.props)) };
        const newComponents = [...components];
        newComponents.splice(index + 1, 0, newComponent);
        updateHistory(newComponents);
    };

    const savePage = async (publish = false) => {
        setIsSaving(true);
        try {
            const payload = { title: pageTitle, slug: pageSlug, layout_json: components, is_published: publish };
            const url = pageId ? `/api/admin/pages/${pageId}` : '/api/admin/pages';
            const method = pageId ? 'PUT' : 'POST';
            const token = localStorage.getItem('token');
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error('Erro ao salvar');
            alert(publish ? 'Página publicada!' : 'Rascunho salvo!');
        } catch (error) {
            alert('Erro ao salvar página');
        } finally { setIsSaving(false); }
    };

    const undo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setComponents(history[historyIndex - 1]); } };
    const redo = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setComponents(history[historyIndex + 1]); } };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id);
        setSelectedId(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);
        if (!over || active.id === over.id) return;
        const oldIndex = components.findIndex(c => c.id === active.id);
        const newIndex = components.findIndex(c => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            const newComponents = arrayMove(components, oldIndex, newIndex);
            updateHistory(newComponents);
        }
    };

    const selectedComponent = components.find(c => c.id === selectedId);
    const activeDragComponent = activeDragId ? components.find(c => c.id === activeDragId) : null;
    const componentIds = components.map(c => c.id);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-screen flex flex-col bg-[#f8f9fb] font-sans text-slate-900">
                <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <LayoutIcon size={18} />
                            </div>
                            <h1 className="font-extrabold text-lg tracking-tight text-slate-800">Visual<span className="text-blue-600">Builder</span></h1>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                            {[{ id: 'desktop', icon: Monitor }, { id: 'tablet', icon: Tablet }, { id: 'mobile', icon: Smartphone }].map((device) => (
                                <button key={device.id} onClick={() => setDevicePreview(device.id as any)} className={`p-2 rounded-lg transition-all duration-200 ${devicePreview === device.id ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <device.icon size={18} />
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={undo} disabled={historyIndex === 0} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-20 text-slate-600 transition-colors"><RotateCcw size={18} /></button>
                            <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-20 text-slate-600 transition-colors"><RotateCw size={18} /></button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            <Globe size={14} className="text-slate-400" />
                            <input type="text" placeholder="Título da página" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none w-40" />
                            <span className="text-slate-300">/</span>
                            <input type="text" placeholder="slug" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} className="bg-transparent border-none text-sm text-slate-500 outline-none w-24" />
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-1" />
                        <button onClick={() => setShowMediaLibrary(true)} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" title="Biblioteca de Mídia"><Image size={20} /></button>
                        <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><Eye size={18} />Preview</button>
                        <button onClick={() => savePage(false)} disabled={isSaving} className="px-5 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">{isSaving ? '...' : 'Salvar'}</button>
                        <button onClick={() => savePage(true)} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95"><Check size={18} />Publicar</button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
                        <div className="flex p-2 bg-slate-50/50 border-b border-slate-100">
                            <button onClick={() => setActiveTab('components')} className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'components' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Blocos</button>
                            <button onClick={() => setActiveTab('layers')} className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'layers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Camadas</button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activeTab === 'components' ? (
                                <ComponentPalette onAdd={addComponent} />
                            ) : (
                                <div className="p-4">
                                    <SortableContext items={componentIds} strategy={verticalListSortingStrategy}>
                                        <LayersPanel components={components} selectedId={selectedId} onSelect={setSelectedId} activeDragId={activeDragId} />
                                    </SortableContext>
                                </div>
                            )}
                        </div>
                    </aside>

                    <main className="flex-1 overflow-y-auto bg-[#f0f2f5] p-12 custom-scrollbar relative">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                        <div className={`mx-auto bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 min-h-[850px] relative rounded-sm overflow-hidden ${devicePreview === 'mobile' ? 'max-w-[375px] ring-8 ring-slate-800 rounded-[3rem]' : devicePreview === 'tablet' ? 'max-w-[768px] ring-4 ring-slate-300 rounded-2xl' : 'max-w-[1200px]'}`}>
                            {devicePreview === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50" />}
                            <SortableContext items={componentIds} strategy={verticalListSortingStrategy}>
                                {components.map((component, index) => (
                                    <SortableCanvasItem
                                        key={component.id}
                                        id={component.id}
                                        index={index}
                                        component={component}
                                        isSelected={selectedId === component.id}
                                        isDragging={activeDragId === component.id}
                                        onSelect={() => setSelectedId(component.id)}
                                        onDelete={() => deleteComponent(component.id)}
                                        onDuplicate={() => duplicateComponent(component.id)}
                                        devicePreview={devicePreview}
                                    />
                                ))}
                            </SortableContext>
                            {components.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-[600px] text-slate-400 group">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-100 shadow-inner">
                                        <Plus size={40} className="text-slate-200 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Sua página está vazia</h3>
                                    <p className="text-sm text-slate-500 max-w-xs text-center leading-relaxed">Arraste um bloco da barra lateral ou use um dos nossos templates para começar.</p>
                                    <button onClick={() => addComponent('hero')} className="mt-8 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Adicionar Hero Banner</button>
                                </div>
                            )}
                        </div>
                    </main>

                    <aside className="w-80 bg-white border-l border-slate-200 z-20 shadow-sm">
                        {selectedComponent ? (
                            <PropertyPanel
                                component={selectedComponent}
                                onChange={(updates) => updateComponent(selectedComponent.id, updates)}
                                onDelete={() => deleteComponent(selectedComponent.id)}
                                onDuplicate={() => duplicateComponent(selectedComponent.id)}
                                onMoveUp={() => { const idx = components.findIndex(c => c.id === selectedComponent.id); if (idx > 0) moveComponent(idx, idx - 1); }}
                                onMoveDown={() => { const idx = components.findIndex(c => c.id === selectedComponent.id); if (idx < components.length - 1) moveComponent(idx, idx + 1); }}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/30">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-slate-100"><Settings size={28} className="opacity-20" /></div>
                                <h4 className="text-sm font-bold text-slate-800 mb-1">Nada selecionado</h4>
                                <p className="text-xs leading-relaxed">Clique em um bloco no canvas para editar seu conteúdo e estilo.</p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {/* DragOverlay — renders a floating ghost while dragging */}
            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activeDragComponent ? (
                    <div className="opacity-90 shadow-2xl rounded-xl ring-2 ring-blue-500 bg-white overflow-hidden scale-[1.02] cursor-grabbing">
                        <div className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <GripVertical size={12} />
                            Movendo: {activeDragComponent.type}
                        </div>
                        <div style={activeDragComponent.styles} className="pointer-events-none max-h-[180px] overflow-hidden">
                            <ComponentPreview type={activeDragComponent.type} props={activeDragComponent.props} />
                        </div>
                    </div>
                ) : null}
            </DragOverlay>

            {showMediaLibrary && (
                <MediaLibrary onClose={() => setShowMediaLibrary(false)} onSelect={(url) => { if (selectedComponent) { updateComponent(selectedComponent.id, { props: { ...selectedComponent.props, src: url } }); } }} />
            )}
            {showPreview && <PreviewModal components={components} onClose={() => setShowPreview(false)} />}
        </DndContext>
    );
};

// ─── Sortable Canvas Item ─────────────────────────────────────────────────────
const SortableCanvasItem: React.FC<{
    id: string; index: number; component: ComponentData;
    isSelected: boolean; isDragging: boolean;
    onSelect: () => void; onDelete: () => void; onDuplicate: () => void; devicePreview: string;
}> = ({ id, component, isSelected, isDragging, onSelect, onDelete, onDuplicate }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isSorting } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`relative group transition-all duration-200 ${isSelected ? 'z-10' : 'z-0'} ${isSorting ? 'cursor-grabbing' : ''}`}>
            <div className={`absolute inset-0 pointer-events-none transition-all duration-200 ${isSelected ? 'ring-4 ring-blue-500 ring-inset bg-blue-500/5' : 'group-hover:ring-2 group-hover:ring-blue-300 group-hover:ring-inset'}`} />
            {/* Drag handle */}
            <div {...attributes} {...listeners}
                className={`absolute top-3 left-3 z-30 cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-white/90 shadow-md border border-slate-200 transition-all duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                title="Arrastar para reordenar" onClick={(e) => e.stopPropagation()}>
                <GripVertical size={14} className="text-slate-400" />
            </div>
            {/* Floating toolbar */}
            <div className={`absolute -top-5 right-4 flex items-center gap-1 transition-all duration-300 z-20 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'}`}>
                <div className="flex bg-white shadow-xl border border-slate-200 rounded-xl p-1 overflow-hidden">
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-2 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors" title="Duplicar"><Copy size={14} /></button>
                    <div className="w-px h-4 bg-slate-100 my-auto" />
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Excluir"><Trash2 size={14} /></button>
                </div>
                <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl shadow-lg shadow-blue-200 flex items-center gap-1.5">
                    <Sparkles size={10} fill="currentColor" />{component.type}
                </div>
            </div>
            <div className={`transition-all duration-500 ${isSelected ? 'scale-[0.99] rounded-xl overflow-hidden shadow-2xl' : ''}`} style={component.styles}>
                <ComponentPreview type={component.type} props={component.props} />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-125 transition-transform"><Plus size={14} /></button>
            </div>
        </div>
    );
};

// ─── Sortable Layer Item ──────────────────────────────────────────────────────
const SortableLayerItem: React.FC<{
    comp: ComponentData; index: number;
    isSelected: boolean; isDragging: boolean; onSelect: () => void;
}> = ({ comp, index, isSelected, isDragging, onSelect }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: comp.id });
    const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

    return (
        <div ref={setNodeRef} style={style} onClick={onSelect}
            className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 hover:border-blue-200 text-slate-600'}`}>
            <div {...attributes} {...listeners}
                className={`cursor-grab active:cursor-grabbing p-0.5 rounded transition-opacity ${isSelected ? 'text-blue-200 opacity-60 hover:opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}
                onClick={(e) => e.stopPropagation()} title="Arrastar">
                <GripVertical size={14} />
            </div>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-blue-500' : 'bg-slate-100 text-slate-400'}`}>{index + 1}</div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate capitalize ${isSelected ? 'text-white' : 'text-slate-800'}`}>{comp.type}</p>
                <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{comp.props.title || 'Sem título'}</p>
            </div>
        </div>
    );
};

const LayersPanel: React.FC<{
    components: ComponentData[]; selectedId: string | null;
    onSelect: (id: string) => void; activeDragId: string | number | null;
}> = ({ components, selectedId, onSelect, activeDragId }) => (
    <div className="space-y-2">
        {components.map((comp, index) => (
            <SortableLayerItem key={comp.id} comp={comp} index={index} isSelected={selectedId === comp.id} isDragging={activeDragId === comp.id} onSelect={() => onSelect(comp.id)} />
        ))}
        {components.length === 0 && <div className="text-center py-8 text-slate-400 text-xs">Nenhum bloco adicionado ainda</div>}
    </div>
);

const ComponentPreview: React.FC<{ type: string; props: any }> = ({ type, props }) => {
    switch (type) {
        case 'hero':
            return (
                <div className="relative bg-slate-900 text-white p-16 text-center overflow-hidden" style={{ minHeight: props.height || '400px' }}>
                    {props.backgroundImage && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${props.backgroundImage})`, opacity: props.overlayOpacity || 0.5 }} />}
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-5xl font-black mb-6 tracking-tight leading-tight">{props.title}</h2>
                        <p className="text-xl text-slate-300 mb-10 leading-relaxed">{props.subtitle}</p>
                        <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl">{props.ctaText}</button>
                    </div>
                </div>
            );
        case 'text':
            return (
                <div className="max-w-3xl mx-auto py-16 px-8">
                    <h3 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">{props.title}</h3>
                    <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: props.content }} />
                </div>
            );
        case 'features':
            return (
                <div className="py-20 px-12 bg-slate-50/50">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{props.title}</h3>
                        <p className="text-slate-500">{props.subtitle}</p>
                    </div>
                    <div className={`grid gap-8 grid-cols-${props.columns || 3}`}>
                        {props.items?.map((item: any, i: number) => (
                            <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><Zap size={24} fill="currentColor" className="opacity-80" /></div>
                                <h4 className="font-bold text-lg text-slate-900 mb-3">{item.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        default:
            return (
                <div className="p-16 text-center text-slate-300 border-2 border-dashed border-slate-100 m-6 rounded-[2rem] bg-slate-50/30">
                    <div className="flex flex-col items-center gap-3"><Box size={40} className="opacity-20" /><span className="font-black uppercase tracking-widest text-[10px]">{type}</span></div>
                </div>
            );
    }
};