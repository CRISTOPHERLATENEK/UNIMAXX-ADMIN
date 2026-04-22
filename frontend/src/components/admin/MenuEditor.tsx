import React, { useState, useEffect } from 'react';
import { 
    DndContext, closestCenter, KeyboardSensor, PointerSensor, 
    useSensor, useSensors, type DragEndEvent 
} from '@dnd-kit/core';
import { 
    arrayMove, SortableContext, sortableKeyboardCoordinates, 
    verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    url: string;
    target: '_self' | '_blank';
    children?: MenuItem[];
}

interface MenuEditorProps {
    location: 'header' | 'footer';
}

export const MenuEditor: React.FC<MenuEditorProps> = ({ location }) => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchMenu();
    }, [location]);

    const fetchMenu = async () => {
        try {
            const res = await fetch(`/api/admin/menus/${location}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Erro ao carregar menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveMenu = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/admin/menus/${location}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items })
            });
            alert('Menu salvo!');
        } catch (error) {
            alert('Erro ao salvar menu');
        } finally {
            setSaving(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over?.id);
            setItems(arrayMove(items, oldIndex, newIndex));
        }
    };

    const addItem = (parentId?: string) => {
        const newItem: MenuItem = {
            id: `menu-${Date.now()}`,
            label: 'Novo Item',
            url: '/',
            target: '_self'
        };

        if (parentId) {
            const addToParent = (items: MenuItem[]): MenuItem[] => {
                return items.map(item => {
                    if (item.id === parentId) {
                        return {
                            ...item,
                            children: [...(item.children || []), newItem]
                        };
                    }
                    if (item.children) {
                        return { ...item, children: addToParent(item.children) };
                    }
                    return item;
                });
            };
            setItems(addToParent(items));
        } else {
            setItems([...items, newItem]);
        }
    };

    const updateItem = (id: string, updates: Partial<MenuItem>) => {
        const updateRecursive = (items: MenuItem[]): MenuItem[] => {
            return items.map(item => {
                if (item.id === id) {
                    return { ...item, ...updates };
                }
                if (item.children) {
                    return { ...item, children: updateRecursive(item.children) };
                }
                return item;
            });
        };
        setItems(updateRecursive(items));
    };

    const removeItem = (id: string) => {
        const removeRecursive = (items: MenuItem[]): MenuItem[] => {
            return items.filter(item => {
                if (item.id === id) return false;
                if (item.children) {
                    item.children = removeRecursive(item.children);
                }
                return true;
            });
        };
        setItems(removeRecursive(items));
    };

    if (loading) return <div className="p-4">Carregando...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold capitalize">
                        Menu {location === 'header' ? 'Principal' : 'do Rodapé'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {location === 'header' 
                            ? 'Menu exibido no topo do site' 
                            : 'Menu exibido no rodapé'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => addItem()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Adicionar Item
                    </button>
                    <button
                        onClick={saveMenu}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : 'Salvar Menu'}
                    </button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {items.map((item) => (
                            <SortableMenuItem
                                key={item.id}
                                item={item}
                                onUpdate={updateItem}
                                onRemove={removeItem}
                                onAddChild={addItem}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {items.length === 0 && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
                    <p>Menu vazio</p>
                    <button
                        onClick={() => addItem()}
                        className="text-blue-600 hover:underline mt-2"
                    >
                        Adicionar primeiro item
                    </button>
                </div>
            )}
        </div>
    );
};

const SortableMenuItem: React.FC<{
    item: MenuItem;
    onUpdate: (id: string, updates: Partial<MenuItem>) => void;
    onRemove: (id: string) => void;
    onAddChild: (parentId: string) => void;
    level?: number;
}> = ({ item, onUpdate, onRemove, onAddChild, level = 0 }) => {
    const [expanded, setExpanded] = useState(true);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: level * 24
    };

    return (
        <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
            <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg group hover:border-gray-300">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 cursor-grab hover:bg-gray-200 rounded"
                >
                    <GripVertical size={16} className="text-gray-400" />
                </button>

                <input
                    type="text"
                    value={item.label}
                    onChange={(e) => onUpdate(item.id, { label: e.target.value })}
                    className="flex-1 px-3 py-1.5 border rounded text-sm"
                    placeholder="Label"
                />

                <input
                    type="text"
                    value={item.url}
                    onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                    className="w-48 px-3 py-1.5 border rounded text-sm"
                    placeholder="URL"
                />

                <select
                    value={item.target}
                    onChange={(e) => onUpdate(item.id, { target: e.target.value as '_self' | '_blank' })}
                    className="px-3 py-1.5 border rounded text-sm"
                >
                    <option value="_self">Mesma aba</option>
                    <option value="_blank">Nova aba</option>
                </select>

                <button
                    onClick={() => onAddChild(item.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Adicionar submenu"
                >
                    <Plus size={16} />
                </button>

                <button
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"
                    title="Remover"
                >
                    <Trash2 size={16} />
                </button>

                {item.children && item.children.length > 0 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-1 hover:bg-gray-200 rounded"
                    >
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                )}

                {item.target === '_blank' && <ExternalLink size={14} className="text-gray-400" />}
            </div>

            {expanded && item.children && item.children.length > 0 && (
                <div className="mt-2 space-y-2">
                    {item.children.map((child) => (
                        <SortableMenuItem
                            key={child.id}
                            item={child}
                            onUpdate={onUpdate}
                            onRemove={onRemove}
                            onAddChild={onAddChild}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
