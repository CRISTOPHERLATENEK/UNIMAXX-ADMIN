import { useState, useEffect } from 'react';

interface ThemeSettings {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    border_radius: string;
    max_width: string;
}

export const useTheme = () => {
    const [theme, setTheme] = useState<ThemeSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTheme();
    }, []);

    const fetchTheme = async () => {
        try {
            const res = await fetch('/api/admin/theme');
            if (res.ok) {
                const data = await res.json();
                setTheme(data);
                applyTheme(data);
            }
        } catch (error) {
            console.error('Erro ao carregar tema:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (themeData: ThemeSettings) => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', themeData.primary_color);
        root.style.setProperty('--secondary-color', themeData.secondary_color);
        root.style.setProperty('--accent-color', themeData.accent_color);
        root.style.setProperty('--font-family', themeData.font_family);
        root.style.setProperty('--border-radius', themeData.border_radius);
        root.style.setProperty('--max-width', themeData.max_width);
    };

    const updateTheme = async (updates: Partial<ThemeSettings>) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/theme', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                const newTheme = { ...theme, ...updates } as ThemeSettings;
                setTheme(newTheme);
                applyTheme(newTheme);
                return true;
            }
        } catch (error) {
            console.error('Erro ao atualizar tema:', error);
        }
        return false;
    };

    return { theme, loading, updateTheme, refresh: fetchTheme };
};
