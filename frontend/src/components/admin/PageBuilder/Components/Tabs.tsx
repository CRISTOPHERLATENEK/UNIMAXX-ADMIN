import React, { useState } from 'react';

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface TabsComponentProps {
    tabs: Tab[];
    defaultTab?: string;
    orientation?: 'horizontal' | 'vertical';
}

export const TabsComponent: React.FC<TabsComponentProps> = ({
    tabs,
    defaultTab,
    orientation = 'horizontal'
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    return (
        <div className={`${orientation === 'vertical' ? 'flex gap-4' : ''}`}>
            <div className={`${orientation === 'vertical' ? 'flex-col w-48' : 'border-b'} flex gap-1`}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${
                            orientation === 'vertical' 
                                ? `text-left rounded ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`
                                : `border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent hover:border-gray-300'}`
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 py-4">
                {tabs.find(t => t.id === activeTab)?.content}
            </div>
        </div>
    );
};
