// Tipos específicos para o Page Builder

export type ComponentType = 
    | 'hero' 
    | 'text' 
    | 'image' 
    | 'features' 
    | 'gallery' 
    | 'video' 
    | 'testimonials'
    | 'pricing'
    | 'cta'
    | 'team'
    | 'faq'
    | 'newsletter'
    | 'countdown'
    | 'map'
    | 'divider'
    | 'spacer';

export interface ComponentStyles {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    borderRadius?: string;
    border?: string;
    color?: string;
    customCSS?: string;
}

export interface ComponentData {
    id: string;
    type: ComponentType;
    props: Record<string, any>;
    styles: ComponentStyles;
}

export interface ComponentTemplate {
    type: ComponentType;
    name: string;
    description: string;
    icon: string;
    defaultProps: Record<string, any>;
    editableFields?: {
        name: string;
        type: 'text' | 'textarea' | 'image' | 'select' | 'color' | 'number';
        label: string;
        options?: { label: string; value: string }[];
    }[];
}

export interface PageLayout {
    id?: number;
    title: string;
    slug: string;
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
    components: ComponentData[];
    is_published: boolean;
    published_at?: string;
}

export interface DevicePreview {
    type: 'desktop' | 'tablet' | 'mobile';
    width: string;
    label: string;
}
