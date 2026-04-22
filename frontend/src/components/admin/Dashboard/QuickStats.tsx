import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface QuickStatsProps {
    recentPages?: any[];
    recentSubmissions?: any[];
    systemStatus?: {
        database: boolean;
        storage: boolean;
        email: boolean;
    };
}

export const QuickStats: React.FC<QuickStatsProps> = ({ 
    recentPages = [],
    recentSubmissions = [],
    systemStatus = { database: true, storage: true, email: false }
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Páginas Recentes */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={18} />
                    Páginas Recentes
                </h3>
                <div className="space-y-3">
                    {recentPages.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nenhuma página recente</p>
                    ) : (
                        recentPages.slice(0, 5).map((page: any) => (
                            <div key={page.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                    <p className="font-medium text-sm">{page.title}</p>
                                    <p className="text-xs text-gray-500">/{page.slug}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    page.is_published 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {page.is_published ? 'Publicada' : 'Rascunho'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Submissões Recentes */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle size={18} />
                    Submissões Recentes
                </h3>
                <div className="space-y-3">
                    {recentSubmissions.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nenhuma submissão recente</p>
                    ) : (
                        recentSubmissions.slice(0, 5).map((sub: any) => (
                            <div key={sub.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                    <p className="font-medium text-sm">{sub.form_name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    sub.is_read 
                                        ? 'bg-gray-100 text-gray-600' 
                                        : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {sub.is_read ? 'Lida' : 'Nova'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Status do Sistema */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Status do Sistema</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                systemStatus.database ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm">Banco de Dados</span>
                        </div>
                        {systemStatus.database ? (
                            <CheckCircle size={18} className="text-green-500" />
                        ) : (
                            <XCircle size={18} className="text-red-500" />
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                systemStatus.storage ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm">Armazenamento</span>
                        </div>
                        {systemStatus.storage ? (
                            <CheckCircle size={18} className="text-green-500" />
                        ) : (
                            <XCircle size={18} className="text-red-500" />
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                systemStatus.email ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                            <span className="text-sm">Email</span>
                        </div>
                        {systemStatus.email ? (
                            <CheckCircle size={18} className="text-green-500" />
                        ) : (
                            <AlertCircle size={18} className="text-yellow-500" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
