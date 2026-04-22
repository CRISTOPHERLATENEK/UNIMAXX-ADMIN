// Tipos para o sistema administrativo

export interface User {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'editor' | 'viewer';
    avatar_url?: string;
    last_login?: string;
    created_at: string;
}

export interface Page {
    id: number;
    slug: string;
    title: string;
    meta_title?: string;
    meta_description?: string;
    is_published: boolean;
    is_homepage: boolean;
    created_at: string;
    updated_at: string;
    created_by?: number;
    updated_by?: number;
}

export interface MediaFile {
    id: number;
    filename: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
    alt_text?: string;
    folder: string;
    created_at: string;
}

export interface MenuItem {
    id: string;
    label: string;
    url: string;
    target: '_self' | '_blank';
    children?: MenuItem[];
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
    required: boolean;
    placeholder?: string;
    options?: string[];
}

export interface Form {
    id: number;
    name: string;
    slug: string;
    fields: FormField[];
    is_active: boolean;
    submissions_count?: number;
}

export interface ThemeSettings {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    success_color: string;
    warning_color: string;
    error_color: string;
    font_family: string;
    heading_font: string;
    base_font_size: string;
    border_radius: string;
    max_width: string;
    custom_css?: string;
}

export interface AuditEntry {
    id: number;
    user_id: number;
    user_name: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity_type: string;
    entity_id: number;
    changes: any;
    ip_address: string;
    created_at: string;
}

export interface AnalyticsData {
    published_pages: number;
    total_media: number;
    submissions_month: number;
    activity_week: number;
}
