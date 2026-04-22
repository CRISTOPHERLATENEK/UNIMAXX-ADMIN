import React from 'react';
import { 
    TrendingUp, Users, FileText, Image, MousePointer,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface AnalyticsProps {
    data: {
        published_pages: number;
        total_media: number;
        submissions_month: number;
        activity_week: number;
    };
    previousData?: {
        published_pages: number;
        total_media: number;
        submissions_month: number;
        activity_week: number;
    };
}

export const Analytics: React.FC<AnalyticsProps> = ({ data, previousData }) => {
    const calculateChange = (current: number, previous: number) => {
        if (!previous) return 0;
        return ((current - previous) / previous) * 100;
    };

    const stats = [
        {
            label: 'Páginas Publicadas',
            value: data.published_pages,
            icon: FileText,
            change: calculateChange(data.published_pages, previousData?.published_pages || 0),
            color: 'blue'
        },
        {
            label: 'Arquivos na Biblioteca',
            value: data.total_media,
            icon: Image,
            change: calculateChange(data.total_media, previousData?.total_media || 0),
            color: 'green'
        },
        {
            label: 'Submissões (30 dias)',
            value: data.submissions_month,
            icon: MousePointer,
            change: calculateChange(data.submissions_month, previousData?.submissions_month || 0),
            color: 'purple'
        },
        {
            label: 'Atividades (7 dias)',
            value: data.activity_week,
            icon: TrendingUp,
            change: calculateChange(data.activity_week, previousData?.activity_week || 0),
            color: 'orange'
        }
    ];

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-700',
            green: 'bg-green-50 text-green-700',
            purple: 'bg-purple-50 text-purple-700',
            orange: 'bg-orange-50 text-orange-700'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${getColorClass(stat.color)}`}>
                            <stat.icon size={24} />
                        </div>
                        {stat.change !== 0 && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                stat.change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {stat.change > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                {Math.abs(stat.change).toFixed(1)}%
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
