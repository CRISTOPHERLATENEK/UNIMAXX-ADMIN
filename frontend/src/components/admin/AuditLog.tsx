import React, { useState, useEffect } from 'react';
import { History, User, FileText, Edit, Trash2, Plus, Search } from 'lucide-react';

interface AuditEntry {
    id: number;
    user_name: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity_type: string;
    entity_id: number;
    changes: any;
    ip_address: string;
    created_at: string;
}

export const AuditLog: React.FC = () => {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/audit', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'CREATE': return <Plus size={16} className="text-green-600" />;
            case 'UPDATE': return <Edit size={16} className="text-blue-600" />;
            case 'DELETE': return <Trash2 size={16} className="text-red-600" />;
            default: return <FileText size={16} />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-800';
            case 'UPDATE': return 'bg-blue-100 text-blue-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.user_name.toLowerCase().includes(filter.toLowerCase()) ||
                            log.entity_type.toLowerCase().includes(filter.toLowerCase());
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        return matchesSearch && matchesAction;
    });

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <History size={24} />
                            Log de Atividades
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Histórico de alterações no sistema
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg"
                            />
                        </div>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="all">Todas ações</option>
                            <option value="CREATE">Criação</option>
                            <option value="UPDATE">Atualização</option>
                            <option value="DELETE">Exclusão</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entidade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Carregando...
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Nenhum registro encontrado
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(log.created_at).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <span className="font-medium">{log.user_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                            {getActionIcon(log.action)}
                                            {log.action === 'CREATE' ? 'Criou' : log.action === 'UPDATE' ? 'Atualizou' : 'Excluiu'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="font-medium">{log.entity_type}</span>
                                        <span className="text-gray-500 ml-2">#{log.entity_id}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                        {log.ip_address}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
