import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertComponentProps {
    type: AlertType;
    title?: string;
    message: string;
    dismissible?: boolean;
}

export const AlertComponent: React.FC<AlertComponentProps> = ({
    type = 'info',
    title,
    message,
    dismissible = false
}) => {
    const styles = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800'
    };

    const icons = {
        info: <Info size={20} />,
        success: <CheckCircle size={20} />,
        warning: <AlertCircle size={20} />,
        error: <XCircle size={20} />
    };

    return (
        <div className={`p-4 rounded-lg border ${styles[type]} flex gap-3`}>
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1">
                {title && <h4 className="font-semibold mb-1">{title}</h4>}
                <p className="text-sm">{message}</p>
            </div>
            {dismissible && (
                <button className="flex-shrink-0 opacity-60 hover:opacity-100">
                    ×
                </button>
            )}
        </div>
    );
};
