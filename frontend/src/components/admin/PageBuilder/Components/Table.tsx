import React from 'react';

interface TableComponentProps {
    title?: string;
    headers: string[];
    rows: string[][];
    striped?: boolean;
    bordered?: boolean;
}

export const TableComponent: React.FC<TableComponentProps> = ({
    title,
    headers,
    rows,
    striped = true,
    bordered = true
}) => {
    return (
        <div className="overflow-x-auto">
            {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
            <table className={`w-full ${bordered ? 'border' : ''}`}>
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx} className="px-4 py-3 text-left font-semibold text-sm">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={striped && rowIdx % 2 === 1 ? 'bg-gray-50' : ''}>
                            {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-4 py-3 text-sm">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
