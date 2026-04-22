import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
    Monitor, Smartphone, Tablet, Save, Eye, RotateCcw, RotateCw,
    Layers, ChevronUp, ChevronDown, Trash2, Copy, Settings, Image
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
    const [history, setHistory] = useState<ComponentData[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [pageTitle, setPageTitle] = useState(initialData?.title || '');
    const [pageSlug, setPageSlug] = useState(initialData?.slug || '');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'components' | 'layers'>('components');

    // Sincronizar com dados iniciais
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
            hero: {
                title: 'Título Principal',
                subtitle: 'Subtítulo descritivo aqui',
                backgroundImage: '',
                ctaText: 'Saiba Mais',
                ctaLink: '#',
                alignment: 'center',
                height: '600px',
                overlayOpacity: 0.5,
                showScrollIndicator: true
            },
            features: {
                title: 'Nossos Recursos',
                subtitle: 'O que oferecemos de melhor',
                columns: 3,
                items: [
                    { icon: 'Check', title: 'Recurso 1', description: 'Descrição detalhada do recurso' },
                    { icon: 'Check', title: 'Recurso 2', description: 'Descrição detalhada do recurso' },
                    { icon: 'Check', title: 'Recurso 3', description: 'Descrição detalhada do recurso' }
                ]
            },
            text: {
                title: 'Título da Seção',
                content: '<p>Conteúdo em formato rich text...</p>',
                alignment: 'left',
                maxWidth: '800px'
            },
            image: {
                src: '',
                alt: '',
                caption: '',
                alignment: 'center',
                borderRadius: '8px',
                shadow: 'medium'
            },
            gallery: {
                images: [],
                layout: 'grid',
                columns: 3,
                gap: '16px',
                lightbox: true
            },
            video: {
                url: '',
                thumbnail: '',
                autoplay: false,
                controls: true,
                loop: false
            },
            testimonials: {
                title: 'O que dizem nossos clientes',
                testimonials: [
                    { name: 'Cliente 1', text: 'Depoimento aqui...', role: 'Cargo', avatar: '' }
                ],
                autoplay: true,
                interval: 5000
            },
            pricing: {
                title: 'Nossos Planos',
                currency: 'R$',
                period: 'mês',
                plans: [
                    { name: 'Básico', price: '99', features: ['Item 1', 'Item 2'], highlighted: false }
                ]
            },
            cta: {
                title: 'Pronto para começar?',
                subtitle: 'Entre em contato conosco hoje mesmo',
                buttonText: 'Fale Conosco',
                buttonLink: '/contato',
                style: 'default'
            },
            team: {
                title: 'Nossa Equipe',
                members: [
                    { name: 'Nome', role: 'Cargo', photo: '', bio: '', social: {} }
                ]
            },
            countdown: {
                title: 'Oferta por tempo limitado',
                targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                expiredText: 'Oferta encerrada',
                showDays: true
            },
            faq: {
                title: 'Perguntas Frequentes',
                items: [
                    { question: 'Pergunta 1?', answer: 'Resposta 1' }
                ],
                allowMultiple: false
            },
            newsletter: {
                title: 'Fique por dentro',
                subtitle: 'Assine nossa newsletter',
                placeholder: 'seu@email.com',
                buttonText: 'Inscrever',
                successMessage: 'Inscrito com sucesso!'
            },
            map: {
                address: 'São Paulo, SP',
                zoom: 15,
                height: '400px',
                marker: true
            },
            divider: {
                style: 'line',
                color: '#e5e7eb',
                spacing: '40px'
            },
            spacer: {
                height: '40px'
            }
        };

        const newComponent: ComponentData = {
            id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            props: templates[type] || {},
            styles: {
                padding: '40px 20px',
                margin: '0',
                backgroundColor: 'transparent',
                backgroundImage: '',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '0',
                border: 'none',
                customCSS: ''
            }
        };

        const newComponents = [...components];
        const insertIndex = index !== undefined ? index : newComponents.length;
        newComponents.splice(insertIndex, 0, newComponent);
        updateHistory(newComponents);
        setSelectedId(newComponent.id);
    };

    const moveComponent = (dragIndex: number, hoverIndex: number) => {
        const newComponents = [...components];
        const [removed] = newComponents.splice(dragIndex, 1);
        newComponents.splice(hoverIndex, 0, removed);
        updateHistory(newComponents);
    };

    const updateComponent = (id: string, updates: Partial<ComponentData>) => {
        const newComponents = components.map(c => 
            c.id === id ? { ...c, ...updates } : c
        );
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
        const newComponent: ComponentData = {
            ...component,
            id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            props: JSON.parse(JSON.stringify(component.props))
        };

        const newComponents = [...components];
        newComponents.splice(index + 1, 0, newComponent);
        updateHistory(newComponents);
    };

    const savePage = async (publish = false) => {
        setIsSaving(true);
        try {
            const payload = {
                title: pageTitle,
                slug: pageSlug,
                layout_json: components,
                is_published: publish
            };

            const url = pageId ? `/api/admin/pages/${pageId}` : '/api/admin/pages';
            const method = pageId ? 'PUT' : 'POST';

            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Erro ao salvar');

            alert(publish ? 'Página publicada!' : 'Rascunho salvo!');
        } catch (error) {
            alert('Erro ao salvar página');
        } finally {
            setIsSaving(false);
        }
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setComponents(history[historyIndex - 1]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setComponents(history[historyIndex + 1]);
        }
    };

    const selectedComponent = components.find(c => c.id === selectedId);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-screen flex flex-col bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="font-bold text-xl text-gray-800">Editor Visual</h1>

                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button 
                                onClick={() => setDevicePreview('desktop')}
                                className={`p-2 rounded transition-colors ${devicePreview === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Monitor size={18} />
                            </button>
                            <button 
                                onClick={() => setDevicePreview('tablet')}
                                className={`p-2 rounded transition-colors ${devicePreview === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Tablet size={18} />
                            </button>
                            <button 
                                onClick={() => setDevicePreview('mobile')}
                                className={`p-2 rounded transition-colors ${devicePreview === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Smartphone size={18} />
                            </button>
                        </div>

                        <div className="h-6 w-px bg-gray-300 mx-2" />

                        <div className="flex items-center gap-1">
                            <button onClick={undo} disabled={historyIndex === 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-30">
                                <RotateCcw size={18} />
                            </button>
                            <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-30">
                                <RotateCw size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Título da página"
                            value={pageTitle}
                            onChange={(e) => setPageTitle(e.target.value)}
                            className="px-3 py-1.5 border rounded text-sm w-48"
                        />
                        <input
                            type="text"
                            placeholder="slug-da-pagina"
                            value={pageSlug}
                            onChange={(e) => setPageSlug(e.target.value)}
                            className="px-3 py-1.5 border rounded text-sm w-32"
                        />

                        <button 
                            onClick={() => setShowMediaLibrary(true)} 
                            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                        >
                            <Image size={16} />
                            Mídia
                        </button>

                        <button 
                            onClick={() => setShowPreview(true)} 
                            className="flex items-center gap-2 px-4 py-1.5 text-sm border rounded hover:bg-gray-50"
                        >
                            <Eye size={16} />
                            Preview
                        </button>

                        <button 
                            onClick={() => savePage(false)} 
                            disabled={isSaving}
                            className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded font-medium"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                        </button>

                        <button 
                            onClick={() => savePage(true)} 
                            disabled={isSaving}
                            className="px-4 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded font-medium shadow-sm"
                        >
                            Publicar
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Esquerda */}
                    <aside className="w-72 bg-white border-r flex flex-col">
                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('components')}
                                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'components' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            >
                                Componentes
                            </button>
                            <button
                                onClick={() => setActiveTab('layers')}
                                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'layers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            >
                                Camadas
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === 'components' ? (
                                <ComponentPalette onAdd={addComponent} />
                            ) : (
                                <LayersPanel 
                                    components={components}
                                    selectedId={selectedId}
                                    onSelect={setSelectedId}
                                    onMove={moveComponent}
                                />
                            )}
                        </div>
                    </aside>

                    {/* Canvas */}
                    <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
                        <div 
                            className={`mx-auto bg-white shadow-lg transition-all duration-300 min-h-[800px] ${
                                devicePreview === 'mobile' ? 'max-w-[375px]' : 
                                devicePreview === 'tablet' ? 'max-w-[768px]' : 'max-w-[1200px]'
                            }`}
                            style={{ marginTop: devicePreview === 'mobile' ? '20px' : '0' }}
                        >
                            {components.map((component, index) => (
                                <DraggableCanvasItem
                                    key={component.id}
                                    index={index}
                                    component={component}
                                    isSelected={selectedId === component.id}
                                    onSelect={() => setSelectedId(component.id)}
                                    onMove={moveComponent}
                                    onDelete={() => deleteComponent(component.id)}
                                    onDuplicate={() => duplicateComponent(component.id)}
                                    devicePreview={devicePreview}
                                />
                            ))}

                            {components.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-96 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg m-8">
                                    <Layers size={48} className="mb-4 opacity-50" />
                                    <p className="text-lg mb-2">Comece a construir sua página</p>
                                    <p className="text-sm">Arraste componentes da barra lateral ou clique para adicionar</p>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Sidebar Direita - Propriedades */}
                    <aside className="w-80 bg-white border-l overflow-y-auto">
                        {selectedComponent ? (
                            <PropertyPanel 
                                component={selectedComponent}
                                onChange={(updates) => updateComponent(selectedComponent.id, updates)}
                                onDelete={() => deleteComponent(selectedComponent.id)}
                                onDuplicate={() => duplicateComponent(selectedComponent.id)}
                                onMoveUp={() => {
                                    const idx = components.findIndex(c => c.id === selectedComponent.id);
                                    if (idx > 0) moveComponent(idx, idx - 1);
                                }}
                                onMoveDown={() => {
                                    const idx = components.findIndex(c => c.id === selectedComponent.id);
                                    if (idx < components.length - 1) moveComponent(idx, idx + 1);
                                }}
                            />
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <Settings size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Selecione um componente para editar suas propriedades</p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {showMediaLibrary && (
                <MediaLibrary 
                    onClose={() => setShowMediaLibrary(false)} 
                    onSelect={(url) => {
                        if (selectedComponent) {
                            updateComponent(selectedComponent.id, {
                                props: { ...selectedComponent.props, src: url }
                            });
                        }
                    }} 
                />
            )}

            {showPreview && (
                <PreviewModal 
                    components={components}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </DndProvider>
    );
};

// Sub-componentes
const DraggableCanvasItem: React.FC<any> = ({ 
    component, index, isSelected, onSelect, onMove, onDelete, onDuplicate, devicePreview 
}) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'canvas-item',
        item: { index },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'canvas-item',
        hover: (item: any) => {
            if (item.index !== index) {
                onMove(item.index, index);
                item.index = index;
            }
        },
    });

    return (
        <div
            ref={(node: any) => drag(drop(node)) as any}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`relative group cursor-pointer transition-all ${
                isDragging ? 'opacity-50' : ''
            } ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : 'hover:ring-1 hover:ring-blue-300 hover:ring-inset'}`}
        >
            {/* Toolbar flutuante */}
            <div className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
                isSelected ? 'opacity-100' : ''
            }`}>
                <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1.5 bg-white shadow rounded hover:bg-gray-50" title="Duplicar">
                    <Copy size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-white shadow rounded hover:bg-red-50 text-red-600" title="Excluir">
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Label do tipo */}
            <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded bg-blue-600 text-white opacity-0 group-hover:opacity-100 transition-opacity ${
                isSelected ? 'opacity-100' : ''
            }`}>
                {component.type}
            </div>

            {/* Renderização do componente (simplificada para preview) */}
            <div style={component.styles}>
                <ComponentPreview type={component.type} props={component.props} />
            </div>
        </div>
    );
};

const ComponentPreview: React.FC<{ type: string; props: any }> = ({ type, props }) => {
    // Renderização simplificada para preview no editor
    switch (type) {
        case 'hero':
            return (
                <div className="relative bg-gray-900 text-white p-12 text-center" style={{ minHeight: props.height || '400px' }}>
                    {props.backgroundImage && (
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ 
                                backgroundImage: `url(${props.backgroundImage})`,
                                opacity: props.overlayOpacity || 0.5
                            }}
                        />
                    )}
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-4">{props.title}</h2>
                        <p className="text-xl mb-6">{props.subtitle}</p>
                        <button className="px-6 py-3 bg-blue-600 rounded">{props.ctaText}</button>
                    </div>
                </div>
            );
        case 'text':
            return (
                <div className="max-w-3xl mx-auto py-8">
                    <h3 className="text-2xl font-bold mb-4">{props.title}</h3>
                    <div dangerouslySetInnerHTML={{ __html: props.content }} />
                </div>
            );
        case 'features':
            return (
                <div className="py-12">
                    <h3 className="text-2xl font-bold text-center mb-8">{props.title}</h3>
                    <div className={`grid gap-6 px-8 grid-cols-${props.columns || 3}`}>
                        {props.items?.map((item: any, i: number) => (
                            <div key={i} className="p-6 border rounded">
                                <h4 className="font-bold mb-2">{item.title}</h4>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        default:
            return <div className="p-8 text-center text-gray-400 border-2 border-dashed m-4">{type}</div>;
    }
};

const LayersPanel: React.FC<any> = ({ components, selectedId, onSelect, onMove }) => {
    return (
        <div className="space-y-1">
            {components.map((comp: any, index: number) => (
                <div
                    key={comp.id}
                    onClick={() => onSelect(comp.id)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
                        selectedId === comp.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                >
                    <span className="text-gray-400 text-xs">{index + 1}</span>
                    <span className="capitalize">{comp.type}</span>
                    <span className="ml-auto text-xs text-gray-400">
                        {comp.props.title?.substring(0, 20) || 'Sem título'}
                    </span>
                </div>
            ))}
        </div>
    );
};
