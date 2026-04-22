import { useState, useCallback } from 'react';

interface ComponentData {
    id: string;
    type: string;
    props: Record<string, any>;
    styles: Record<string, any>;
}

interface UsePageBuilderOptions {
    initialComponents?: ComponentData[];
    onChange?: (components: ComponentData[]) => void;
}

export const usePageBuilder = (options: UsePageBuilderOptions = {}) => {
    const { initialComponents = [], onChange } = options;

    const [components, setComponents] = useState<ComponentData[]>(initialComponents);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [history, setHistory] = useState<ComponentData[][]>([initialComponents]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const updateHistory = useCallback((newComponents: ComponentData[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newComponents);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setComponents(newComponents);
        onChange?.(newComponents);
    }, [history, historyIndex, onChange]);

    const addComponent = useCallback((type: string, defaultProps: Record<string, any> = {}) => {
        const newComponent: ComponentData = {
            id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            props: defaultProps,
            styles: {
                padding: '40px 20px',
                margin: '0',
                backgroundColor: 'transparent',
                borderRadius: '0'
            }
        };
        const newComponents = [...components, newComponent];
        updateHistory(newComponents);
        setSelectedId(newComponent.id);
        return newComponent;
    }, [components, updateHistory]);

    const updateComponent = useCallback((id: string, updates: Partial<ComponentData>) => {
        const newComponents = components.map(c => 
            c.id === id ? { ...c, ...updates } : c
        );
        updateHistory(newComponents);
    }, [components, updateHistory]);

    const removeComponent = useCallback((id: string) => {
        const newComponents = components.filter(c => c.id !== id);
        updateHistory(newComponents);
        if (selectedId === id) setSelectedId(null);
    }, [components, selectedId, updateHistory]);

    const moveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
        const newComponents = [...components];
        const [removed] = newComponents.splice(dragIndex, 1);
        newComponents.splice(hoverIndex, 0, removed);
        updateHistory(newComponents);
    }, [components, updateHistory]);

    const duplicateComponent = useCallback((id: string) => {
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
    }, [components, updateHistory]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setComponents(history[historyIndex - 1]);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setComponents(history[historyIndex + 1]);
        }
    }, [history, historyIndex]);

    const selectedComponent = components.find(c => c.id === selectedId);

    return {
        components,
        selectedId,
        selectedComponent,
        history,
        historyIndex,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        setSelectedId,
        addComponent,
        updateComponent,
        removeComponent,
        moveComponent,
        duplicateComponent,
        undo,
        redo
    };
};
