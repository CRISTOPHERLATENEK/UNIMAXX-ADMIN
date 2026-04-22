import React from 'react';
import { X, Monitor, Smartphone, Tablet } from 'lucide-react';

interface PreviewModalProps {
    components: any[];
    onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ components, onClose }) => {
    const [device, setDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    const getDeviceWidth = () => {
        switch (device) {
            case 'mobile': return '375px';
            case 'tablet': return '768px';
            default: return '100%';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold">Preview da Página</h3>
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setDevice('desktop')}
                            className={`p-2 rounded ${device === 'desktop' ? 'bg-gray-700' : ''}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button
                            onClick={() => setDevice('tablet')}
                            className={`p-2 rounded ${device === 'tablet' ? 'bg-gray-700' : ''}`}
                        >
                            <Tablet size={18} />
                        </button>
                        <button
                            onClick={() => setDevice('mobile')}
                            className={`p-2 rounded ${device === 'mobile' ? 'bg-gray-700' : ''}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800 rounded"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto bg-gray-100 p-8">
                <div
                    className="mx-auto bg-white shadow-2xl transition-all duration-300"
                    style={{ width: getDeviceWidth(), minHeight: '100%' }}
                >
                    {components.map((component) => (
                        <PreviewComponent key={component.id} component={component} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const PreviewComponent: React.FC<{ component: any }> = ({ component }) => {
    const { type, props, styles } = component;

    const renderContent = () => {
        switch (type) {
            case 'hero':
                return (
                    <div className="relative text-center" style={{ minHeight: props.height || '500px' }}>
                        {props.backgroundImage && (
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${props.backgroundImage})`,
                                    opacity: props.overlayOpacity || 0.5
                                }}
                            />
                        )}
                        <div className="relative z-10 py-20">
                            <h1 className="text-5xl font-bold mb-4">{props.title}</h1>
                            <p className="text-xl mb-8">{props.subtitle}</p>
                            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg">
                                {props.ctaText}
                            </button>
                        </div>
                    </div>
                );

            case 'features':
                return (
                    <div className="py-16">
                        <h2 className="text-3xl font-bold text-center mb-4">{props.title}</h2>
                        <p className="text-center text-gray-600 mb-12">{props.subtitle}</p>
                        <div className={`grid gap-8 px-8 grid-cols-${props.columns || 3}`}>
                            {props.items?.map((item: any, idx: number) => (
                                <div key={idx} className="text-center p-6">
                                    <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="max-w-3xl mx-auto py-12">
                        <h2 className="text-3xl font-bold mb-4">{props.title}</h2>
                        <div dangerouslySetInnerHTML={{ __html: props.content }} />
                    </div>
                );

            case 'cta':
                return (
                    <div className="text-center py-16">
                        <h2 className="text-3xl font-bold mb-4">{props.title}</h2>
                        <p className="text-xl mb-8">{props.subtitle}</p>
                        <button className="px-8 py-3 bg-blue-600 text-white rounded-lg">
                            {props.buttonText}
                        </button>
                    </div>
                );

            default:
                return <div className="p-8 text-center text-gray-400">{type}</div>;
        }
    };

    return (
        <div style={styles}>
            {renderContent()}
        </div>
    );
};
