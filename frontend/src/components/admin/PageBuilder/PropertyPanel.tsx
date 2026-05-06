import React, { useState } from 'react';
import { 
    Type, Palette, Layout, Code, Trash2, Copy, 
    ChevronUp, ChevronDown, Settings, Image as ImageIcon,
    Sparkles, Box, Sliders, Eye, HelpCircle
} from 'lucide-react';

interface PropertyPanelProps {
    component: any;
    onChange: (updates: any) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
    component, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown
}) => {
    const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');

    const updateProps = (key: string, value: any) => {
        onChange({
            props: { ...component.props, [key]: value }
        });
    };

    const updateStyles = (key: string, value: any) => {
        onChange({
            styles: { ...component.styles, [key]: value }
        });
    };

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-100 shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b bg-gray-50/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Box size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 capitalize leading-none">{component.type}</h3>
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mt-1 block">ID: {component.id.slice(-6)}</span>
                        </div>
                    </div>
                </div>

                {/* Ações rápidas - Redesenhadas */}
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={onMoveUp} className="flex flex-col items-center justify-center p-2 hover:bg-white hover:shadow-md rounded-xl transition-all group border border-transparent hover:border-gray-100" title="Mover para cima">
                        <ChevronUp size={16} className="text-gray-400 group-hover:text-blue-600" />
                    </button>
                    <button onClick={onMoveDown} className="flex flex-col items-center justify-center p-2 hover:bg-white hover:shadow-md rounded-xl transition-all group border border-transparent hover:border-gray-100" title="Mover para baixo">
                        <ChevronDown size={16} className="text-gray-400 group-hover:text-blue-600" />
                    </button>
                    <button onClick={onDuplicate} className="flex flex-col items-center justify-center p-2 hover:bg-white hover:shadow-md rounded-xl transition-all group border border-transparent hover:border-gray-100" title="Duplicar">
                        <Copy size={16} className="text-gray-400 group-hover:text-blue-600" />
                    </button>
                    <button onClick={onDelete} className="flex flex-col items-center justify-center p-2 hover:bg-red-50 hover:shadow-md rounded-xl transition-all group border border-transparent hover:border-red-100" title="Excluir">
                        <Trash2 size={16} className="text-gray-400 group-hover:text-red-600" />
                    </button>
                </div>
            </div>

            {/* Tabs - Estilo Moderno */}
            <div className="flex p-1.5 bg-gray-100/50 mx-4 mt-4 rounded-xl border border-gray-100">
                {(['content', 'style', 'advanced'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 rounded-lg transition-all ${
                            activeTab === tab 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab === 'content' && <Type size={14} />}
                        {tab === 'style' && <Palette size={14} />}
                        {tab === 'advanced' && <Code size={14} />}
                        {tab === 'content' ? 'Conteúdo' : tab === 'style' ? 'Design' : 'JSON'}
                    </button>
                ))}
            </div>

            {/* Conteúdo do Painel */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {activeTab === 'content' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles size={14} className="text-blue-500" />
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Campos de Conteúdo</h4>
                        </div>
                        <ContentFields 
                            type={component.type} 
                            props={component.props} 
                            onChange={updateProps}
                        />
                    </div>
                )}

                {activeTab === 'style' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="flex items-center gap-2 mb-6">
                            <Sliders size={14} className="text-blue-500" />
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Aparência e Layout</h4>
                        </div>
                        <StyleFields 
                            styles={component.styles} 
                            onChange={updateStyles}
                        />
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="flex items-center gap-2 mb-6">
                            <Code size={14} className="text-blue-500" />
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Configurações Avançadas</h4>
                        </div>
                        <AdvancedFields 
                            component={component}
                            onChange={onChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const ContentFields: React.FC<{ type: string; props: any; onChange: (k: string, v: any) => void }> = ({ 
    type, props, onChange 
}) => {
    const renderField = (label: string, key: string, inputType: string = 'text', options?: any) => {
        const value = props[key] || '';

        return (
            <div className="mb-5 group">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-[13px] font-bold text-gray-700 group-focus-within:text-blue-600 transition-colors">{label}</label>
                    <HelpCircle size={12} className="text-gray-300 cursor-help hover:text-gray-400" />
                </div>
                
                {inputType === 'textarea' ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(key, e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none resize-none"
                    />
                ) : inputType === 'select' ? (
                    <div className="relative">
                        <select
                            value={value}
                            onChange={(e) => onChange(key, e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none"
                        >
                            {options.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                ) : inputType === 'color' ? (
                    <div className="flex gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                            <input
                                type="color"
                                value={value || '#000000'}
                                onChange={(e) => onChange(key, e.target.value)}
                                className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                            />
                        </div>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(key, e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                            placeholder="#000000"
                        />
                    </div>
                ) : inputType === 'image' ? (
                    <div className="space-y-3">
                        {value && (
                            <div className="relative group/img rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                                <img src={value} alt="" className="w-full h-32 object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye size={20} className="text-white" />
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => onChange(key, e.target.value)}
                                placeholder="URL da imagem..."
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                            />
                            <button className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
                                <ImageIcon size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <input
                        type={inputType}
                        value={value}
                        onChange={(e) => onChange(key, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                    />
                )}
            </div>
        );
    };

    switch (type) {
        case 'hero':
            return (
                <div>
                    {renderField('Título Principal', 'title')}
                    {renderField('Subtítulo', 'subtitle', 'textarea')}
                    {renderField('Imagem de Fundo', 'backgroundImage', 'image')}
                    {renderField('Texto do Botão', 'ctaText')}
                    {renderField('Link do Botão', 'ctaLink')}
                    {renderField('Alinhamento', 'alignment', 'select', [
                        { value: 'left', label: 'Esquerda' },
                        { value: 'center', label: 'Centro' },
                        { value: 'right', label: 'Direita' }
                    ])}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-[13px] font-bold text-gray-700">Opacidade do Overlay</label>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{Math.round((props.overlayOpacity || 0.5) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round((props.overlayOpacity || 0.5) * 100)}
                            onChange={(e) => onChange('overlayOpacity', parseFloat(e.target.value) / 100)}
                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>
            );

        case 'text':
            return (
                <div>
                    {renderField('Título', 'title')}
                    {renderField('Conteúdo', 'content', 'textarea')}
                    {renderField('Alinhamento', 'alignment', 'select', [
                        { value: 'left', label: 'Esquerda' },
                        { value: 'center', label: 'Centro' },
                        { value: 'right', label: 'Direita' },
                        { value: 'justify', label: 'Justificado' }
                    ])}
                </div>
            );

        case 'features':
            return (
                <div>
                    {renderField('Título da Seção', 'title')}
                    {renderField('Subtítulo', 'subtitle')}
                    {renderField('Colunas', 'columns', 'select', [
                        { value: 2, label: '2 colunas' },
                        { value: 3, label: '3 colunas' },
                        { value: 4, label: '4 colunas' }
                    ])}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-[13px] font-bold text-gray-700">Itens do Grid</label>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{props.items?.length || 0} itens</span>
                        </div>
                        <div className="space-y-3">
                            {props.items?.map((item: any, idx: number) => (
                                <div key={idx} className="group/item border border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Item #{idx + 1}</span>
                                        <button 
                                            onClick={() => {
                                                const newItems = props.items.filter((_: any, i: number) => i !== idx);
                                                onChange('items', newItems);
                                            }}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => {
                                            const newItems = [...props.items];
                                            newItems[idx].title = e.target.value;
                                            onChange('items', newItems);
                                        }}
                                        placeholder="Título do item"
                                        className="w-full px-3 py-2 mb-2 bg-white border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => {
                                            const newItems = [...props.items];
                                            newItems[idx].description = e.target.value;
                                            onChange('items', newItems);
                                        }}
                                        placeholder="Descrição curta..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => onChange('items', [...(props.items || []), { title: 'Novo Item', description: '' }])}
                            className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                            + Adicionar Novo Item
                        </button>
                    </div>
                </div>
            );

        default:
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <Settings size={32} className="text-gray-300 animate-spin-slow" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">Editor de Bloco</p>
                    <p className="text-xs text-gray-500 mt-2 max-w-[200px] leading-relaxed">
                        Este componente usa configurações padrão. Você pode ajustar o design na aba ao lado.
                    </p>
                </div>
            );
    }
};

const StyleFields: React.FC<{ styles: any; onChange: (k: string, v: any) => void }> = ({ styles, onChange }) => {
    return (
        <div className="space-y-6">
            {/* Novo Campo de Estilo do Bloco - Destaque */}
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-8">
                <label className="block text-[11px] font-bold text-blue-100 uppercase tracking-widest mb-3">Estilo Visual do Bloco</label>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => onChange('block_style', 'fluid')}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                            (styles.block_style || 'fluid') === 'fluid' 
                                ? 'bg-white text-blue-600 shadow-md' 
                                : 'bg-blue-700 text-blue-200 hover:bg-blue-500'
                        }`}
                    >
                        Fluido
                    </button>
                    <button 
                        onClick={() => onChange('block_style', 'card')}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                            styles.block_style === 'card' 
                                ? 'bg-white text-blue-600 shadow-md' 
                                : 'bg-blue-700 text-blue-200 hover:bg-blue-500'
                        }`}
                    >
                        Cartão
                    </button>
                </div>
                <p className="text-[10px] text-blue-200 mt-3 leading-relaxed">
                    O estilo <b>Cartão</b> adiciona uma moldura elegante com sombra suave ao redor do conteúdo.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Padding</label>
                    <input
                        type="text"
                        value={styles.padding || '40px 20px'}
                        onChange={(e) => onChange('padding', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="40px 20px"
                    />
                </div>
                <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Margin</label>
                    <input
                        type="text"
                        value={styles.margin || '0'}
                        onChange={(e) => onChange('margin', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="0"
                    />
                </div>
            </div>

            <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Cor de Fundo</label>
                <div className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                        <input
                            type="color"
                            value={styles.backgroundColor || '#ffffff'}
                            onChange={(e) => onChange('backgroundColor', e.target.value)}
                            className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                        />
                    </div>
                    <input
                        type="text"
                        value={styles.backgroundColor || ''}
                        onChange={(e) => onChange('backgroundColor', e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="transparent ou #ffffff"
                    />
                </div>
            </div>

            <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Arredondamento (Radius)</label>
                <div className="relative">
                    <select
                        value={styles.borderRadius || '0'}
                        onChange={(e) => onChange('borderRadius', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none"
                    >
                        <option value="0">Quadrado (0px)</option>
                        <option value="8px">Pequeno (8px)</option>
                        <option value="16px">Médio (16px)</option>
                        <option value="24px">Grande (24px)</option>
                        <option value="40px">Extra Grande (40px)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Borda Personalizada</label>
                <input
                    type="text"
                    value={styles.border || 'none'}
                    onChange={(e) => onChange('border', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="ex: 1px solid #eee"
                />
            </div>
        </div>
    );
};

const AdvancedFields: React.FC<{ component: any; onChange: (updates: any) => void }> = ({ component, onChange }) => {
    const [jsonValue, setJsonValue] = useState(JSON.stringify(component, null, 2));

    const handleJsonChange = (value: string) => {
        setJsonValue(value);
        try {
            const parsed = JSON.parse(value);
            onChange(parsed);
        } catch (e) {
            // JSON inválido, não atualiza
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <HelpCircle size={14} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Atenção</span>
                </div>
                <p className="text-[11px] text-amber-600 leading-relaxed">
                    Edite o código abaixo apenas se souber o que está fazendo. Alterações incorretas podem quebrar o visual do bloco.
                </p>
            </div>

            <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">CSS Customizado</label>
                <textarea
                    value={component.styles?.customCSS || ''}
                    onChange={(e) => onChange({
                        styles: { ...component.styles, customCSS: e.target.value }
                    })}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900 text-blue-400 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                    placeholder=".minha-classe { color: red; }"
                />
            </div>

            <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Estrutura JSON</label>
                <textarea
                    value={jsonValue}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 bg-gray-900 text-green-400 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                />
            </div>
        </div>
    );
};
