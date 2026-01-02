import React from 'react';

export const Table = ({ children, className = '' }) => {
    return (
        <div className="overflow-x-auto -mx-6 px-6">
            <table className={`w-full ${className}`}>
                {children}
            </table>
        </div>
    );
};

export const Thead = ({ children, className = '' }) => {
    return (
        <thead className={`bg-dark-tertiary/50 border-b border-surface-border ${className}`}>
            {children}
        </thead>
    );
};

export const Tbody = ({ children, className = '' }) => {
    return (
        <tbody className={`divide-y divide-surface-border ${className}`}>
            {children}
        </tbody>
    );
};

export const Tr = ({ children, className = '', onClick }) => {
    return (
        <tr
            className={`hover:bg-surface-glass transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
};

export const Th = ({ children, className = '', align = 'left' }) => {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[align];

    return (
        <th className={`px-4 py-3 ${alignClass} text-xs font-semibold text-gray-400 uppercase tracking-wider ${className}`}>
            {children}
        </th>
    );
};

export const Td = ({ children, className = '', align = 'left', colSpan }) => {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[align];

    return (
        <td colSpan={colSpan} className={`px-4 py-4 ${alignClass} text-sm text-gray-300 ${className}`}>
            {children}
        </td>
    );
};

export const Tfoot = ({ children, className = '' }) => {
    return (
        <tfoot className={`border-t-2 border-surface-border bg-dark-tertiary/50 ${className}`}>
            {children}
        </tfoot>
    );
};
