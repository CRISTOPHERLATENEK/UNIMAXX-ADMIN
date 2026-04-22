import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Copy, Trash2 } from 'lucide-react';

interface DraggableComponentProps {
    component: any;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    onMove: (dragIndex: number, hoverIndex: number) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
    component,
    index,
    isSelected,
    onSelect,
    onMove,
    onDelete,
    onDuplicate
}) => {
    const [{ isDragging }, drag, preview] = useDrag({
        type: 'COMPONENT',
        item: { index },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'COMPONENT',
        hover: (item: { index: number }) => {
            if (item.index !== index) {
                onMove(item.index, index);
                item.index = index;
            }
        },
    });

    return (
        <div
            ref={(node: any) => preview(drop(node)) as any}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            className={`relative group mb-4 transition-all ${
                isDragging ? 'opacity-50' : ''
            } ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'}`}
        >
            {/* Toolbar */}
            <div className={`absolute -top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="p-1.5 bg-white shadow-md rounded hover:bg-gray-50"
                    title="Duplicar"
                >
                    <Copy size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 bg-white shadow-md rounded hover:bg-red-50 text-red-600"
                    title="Excluir"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Label */}
            <div className={`absolute -top-3 left-2 px-2 py-1 text-xs rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {component.type}
            </div>

            {/* Drag Handle */}
            <div
                ref={drag as any}
                className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-100"
            >
                <GripVertical size={16} className="text-gray-400" />
            </div>

            {/* Content */}
            <div className="pt-4">
                <ComponentThumbnail component={component} />
            </div>
        </div>
    );
};

const ComponentThumbnail: React.FC<{ component: any }> = ({ component }) => {
    const { type, props } = component;

    switch (type) {
        case 'hero':
            return (
                <div className="bg-gray-900 text-white p-8 text-center rounded">
                    <h3 className="text-xl font-bold">{props.title || 'Hero'}</h3>
                    <p className="text-sm opacity-80">{props.subtitle || 'Subtítulo'}</p>
                </div>
            );
        case 'features':
            return (
                <div className="bg-gray-100 p-4 rounded">
                    <h4 className="font-bold text-center mb-2">{props.title || 'Features'}</h4>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-1 bg-white p-2 rounded text-center text-xs">
                                Item {i}
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'text':
            return (
                <div className="p-4 border rounded">
                    <h4 className="font-bold">{props.title || 'Título'}</h4>
                    <p className="text-sm text-gray-600">Conteúdo de texto...</p>
                </div>
            );
        default:
            return (
                <div className="p-4 border-2 border-dashed rounded text-center text-gray-400">
                    {type}
                </div>
            );
    }
};
