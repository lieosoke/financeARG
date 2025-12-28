import React from 'react';
import { Shield, Check, X, Edit2 } from 'lucide-react';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';
import { rolePermissions, roleConfig, ROLES } from '../../config/permissions';

const RolePermission = () => {
    // Roles from config
    const roles = Object.keys(ROLES).map(key => {
        const roleKey = ROLES[key];
        const config = roleConfig[roleKey];
        return {
            id: roleKey,
            name: config.label,
            description: config.description,
            color: config.variant,
        };
    });

    // Define permissions structure
    const permissions = [
        { id: 'dashboard', name: 'Dashboard', category: 'Dashboard' },
        { id: 'jamaah:view', name: 'View Jamaah', category: 'Jamaah' },
        { id: 'jamaah:create', name: 'Create Jamaah', category: 'Jamaah' },
        { id: 'jamaah:edit', name: 'Edit Jamaah', category: 'Jamaah' },
        { id: 'jamaah:delete', name: 'Delete Jamaah', category: 'Jamaah' },
        { id: 'paket:view', name: 'View Paket', category: 'Paket' },
        { id: 'paket:create', name: 'Create Paket', category: 'Paket' },
        { id: 'paket:edit', name: 'Edit Paket', category: 'Paket' },
        { id: 'paket:delete', name: 'Delete Paket', category: 'Paket' },
        { id: 'keuangan:view', name: 'View Keuangan', category: 'Keuangan' },
        { id: 'keuangan:create', name: 'Create Transaction', category: 'Keuangan' },
        { id: 'keuangan:delete', name: 'Delete Transaction', category: 'Keuangan' },
        { id: 'laporan:view', name: 'View Laporan', category: 'Laporan' },
        { id: 'laporan:export', name: 'Export Laporan', category: 'Laporan' },
        { id: 'settings:users', name: 'Manage Users', category: 'Settings' },
        { id: 'settings:roles', name: 'View Roles', category: 'Settings' },
    ];

    const hasPermission = (role, permissionId) => {
        const perms = rolePermissions[role] || [];
        return perms.includes(permissionId);
    };

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) {
            acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
    }, {});

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Role & Permission</h1>
                <p className="text-sm text-gray-500 mt-1">Kelola role dan hak akses pengguna</p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map((role) => (
                    <Card key={role.id} className="!p-4" hoverable>
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-surface-glass rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">{role.name}</h3>
                                <Badge variant={role.color} size="sm">{role.id}</Badge>
                            </div>
                            <p className="text-xs text-gray-500">{role.description}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Permission Matrix */}
            <Card title="Permission Matrix" subtitle="Hak akses per role">
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="table-dark w-full">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider sticky left-0 bg-dark-secondary">
                                    Permission
                                </th>
                                {roles.map((role) => (
                                    <th key={role.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {role.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <React.Fragment key={category}>
                                    {/* Category Header */}
                                    <tr className="bg-dark-tertiary/50">
                                        <td colSpan={roles.length + 1} className="px-4 py-2">
                                            <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                                                {category}
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Permission Rows */}
                                    {perms.map((perm) => (
                                        <tr key={perm.id} className="hover:bg-surface-glass transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-300 sticky left-0 bg-dark-secondary">
                                                {perm.name}
                                            </td>
                                            {roles.map((role) => (
                                                <td key={`${perm.id}-${role.id}`} className="px-4 py-3 text-center">
                                                    {hasPermission(role.id, perm.id) ? (
                                                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20">
                                                            <Check className="w-4 h-4 text-emerald-400" />
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/10">
                                                            <X className="w-4 h-4 text-rose-400/50" />
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Legend */}
            <Card className="!p-4">
                <div className="flex flex-wrap items-center gap-6">
                    <span className="text-sm text-gray-400">Keterangan:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-400">Memiliki akses</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <X className="w-4 h-4 text-rose-400/50" />
                        </div>
                        <span className="text-sm text-gray-400">Tidak memiliki akses</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default RolePermission;
