import React, { useState } from 'react';
import { Search, Plus, Building2, Phone, Edit2, Trash2, Loader2, X, Save, Mail, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/molecules/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Badge from '../../components/atoms/Badge';
import Modal from '../../components/molecules/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/atoms/Table';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '../../hooks/useVendors';
import { useForm } from 'react-hook-form';

const VendorManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const limit = 20;

    // Build query params
    const queryParams = {
        page: currentPage,
        limit,
        ...(filterType !== 'all' && { type: filterType }),
        ...(searchQuery && { search: searchQuery }),
    };

    // Fetch data from API
    const { data: vendorsData, isLoading, error } = useVendors(queryParams);
    const createMutation = useCreateVendor({
        onSuccess: () => {
            toast.success('Vendor berhasil ditambahkan');
            setShowAddModal(false);
        },
        onError: (err) => toast.error(err.message || 'Gagal menambahkan vendor'),
    });
    const updateMutation = useUpdateVendor({
        onSuccess: () => {
            toast.success('Vendor berhasil diperbarui');
            setEditingVendor(null);
        },
        onError: (err) => toast.error(err.message || 'Gagal memperbarui vendor'),
    });
    const deleteMutation = useDeleteVendor({
        onSuccess: () => toast.success('Vendor berhasil dihapus'),
        onError: (err) => toast.error(err.message || 'Gagal menghapus vendor'),
    });

    // Extract data with fallbacks
    const vendors = vendorsData?.data || [];
    const pagination = vendorsData?.pagination || { total: 0, totalPages: 1 };

    // Filter locally for additional search (API may support it)
    const filteredData = vendors;

    const vendorTypes = [
        { value: 'all', label: 'Semua' },
        { value: 'airlines', label: 'Tiket Pesawat' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'hotel_transit', label: 'Hotel Transit' },
        { value: 'transport', label: 'Transport' },
        { value: 'visa', label: 'Visa' },
        { value: 'handling', label: 'Handling' },
        { value: 'catering', label: 'Konsumsi' },
        { value: 'manasik', label: 'Manasik' },
        { value: 'other', label: 'Lainnya' },
    ];

    const getTypeBadge = (type) => {
        const config = {
            airlines: { variant: 'info', label: 'Tiket Pesawat' },
            hotel: { variant: 'primary', label: 'Hotel' },
            hotel_transit: { variant: 'primary', label: 'Hotel Transit' },
            transport: { variant: 'warning', label: 'Transport' },
            visa: { variant: 'neutral', label: 'Visa' },
            handling: { variant: 'success', label: 'Handling' },
            catering: { variant: 'success', label: 'Konsumsi' },
            manasik: { variant: 'info', label: 'Manasik' },
            other: { variant: 'neutral', label: 'Lainnya' },
        };
        const t = config[type] || { variant: 'neutral', label: type || 'Lainnya' };
        return <Badge variant={t.variant}>{t.label}</Badge>;
    };

    const handleDelete = (vendor) => {
        if (window.confirm(`Yakin ingin menghapus vendor "${vendor.name}"?`)) {
            deleteMutation.mutate(vendor.id);
        }
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setCurrentPage(1);
    };

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="!p-6 max-w-md">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-rose-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-rose-400 text-2xl">!</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Gagal Memuat Data</h3>
                        <p className="text-gray-400 text-sm">{error.message || 'Terjadi kesalahan saat memuat data vendor'}</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Manajemen Vendor</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data vendor dan supplier</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
                    Tambah Vendor
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{isLoading ? '...' : pagination.total || vendors.length}</p>
                            <p className="text-xs text-gray-500">Total Vendor</p>
                        </div>
                    </div>
                </Card>
                {vendorTypes.slice(1, 5).map((type) => (
                    <Card key={type.value} className="!p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface-glass rounded-xl flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {isLoading ? '...' : vendors.filter(v => v.type === type.value).length}
                                </p>
                                <p className="text-xs text-gray-500">{type.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari nama vendor..."
                            icon={<Search className="w-4 h-4" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {vendorTypes.slice(0, 5).map((type) => (
                            <Button
                                key={type.value}
                                variant={filterType === type.value ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleFilterChange(type.value)}
                            >
                                {type.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <Card>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-3" />
                            <p className="text-gray-400">Memuat data vendor...</p>
                        </div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Tidak ada data</h3>
                        <p className="text-gray-500">Belum ada data vendor</p>
                    </div>
                ) : (
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Vendor</Th>
                                <Th>Tipe</Th>
                                <Th>Kontak</Th>
                                <Th>Alamat</Th>
                                <Th align="center">Aksi</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredData.map((vendor) => (
                                <Tr key={vendor.id}>
                                    <Td>
                                        <div>
                                            <p className="font-medium text-white">{vendor.name}</p>
                                            <p className="text-xs text-gray-500">{vendor.contactPerson || '-'}</p>
                                        </div>
                                    </Td>
                                    <Td>
                                        {getTypeBadge(vendor.type)}
                                    </Td>
                                    <Td>
                                        <div className="flex flex-col gap-1 text-sm">
                                            {vendor.phone && (
                                                <span className="flex items-center gap-1 text-gray-300">
                                                    <Phone className="w-3 h-3 text-gray-500" />
                                                    {vendor.phone}
                                                </span>
                                            )}
                                            {vendor.email && (
                                                <span className="flex items-center gap-1 text-gray-400 text-xs">
                                                    <Mail className="w-3 h-3" />
                                                    {vendor.email}
                                                </span>
                                            )}
                                        </div>
                                    </Td>
                                    <Td className="text-gray-400">
                                        {vendor.address || '-'}
                                    </Td>
                                    <Td align="center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="!p-2 text-blue-400 hover:text-blue-300"
                                                title="Riwayat Keuangan"
                                                onClick={() => navigate(`/keuangan/hutang?search=${encodeURIComponent(vendor.name)}`)}
                                            >
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="!p-2"
                                                onClick={() => setEditingVendor(vendor)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="!p-2 text-rose-400 hover:text-rose-300"
                                                onClick={() => handleDelete(vendor)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}

                {/* Pagination */}
                {filteredData.length > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
                        <p className="text-sm text-gray-500">
                            Menampilkan {filteredData.length} dari {pagination.total || filteredData.length} vendor
                        </p>
                    </div>
                )}
            </Card>

            {/* Add Vendor Modal */}
            <VendorFormModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
            />

            {/* Edit Vendor Modal */}
            <VendorFormModal
                isOpen={!!editingVendor}
                onClose={() => setEditingVendor(null)}
                onSubmit={(data) => updateMutation.mutate({ id: editingVendor?.id, data })}
                isLoading={updateMutation.isPending}
                vendor={editingVendor}
            />
        </div>
    );
};

// Vendor Form Modal Component
const VendorFormModal = ({ isOpen, onClose, onSubmit, isLoading, vendor }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: vendor?.name || '',
            type: vendor?.type || 'other',
            contactPerson: vendor?.contactPerson || '',
            phone: vendor?.phone || '',
            email: vendor?.email || '',
            address: vendor?.address || '',
            bankAccount: vendor?.bankAccount || '',
            bankName: vendor?.bankName || '',
        },
    });

    React.useEffect(() => {
        if (vendor) {
            reset({
                name: vendor.name || '',
                type: vendor.type || 'other',
                contactPerson: vendor.contactPerson || '',
                phone: vendor.phone || '',
                email: vendor.email || '',
                address: vendor.address || '',
                bankAccount: vendor.bankAccount || '',
                bankName: vendor.bankName || '',
            });
        } else {
            reset({
                name: '',
                type: 'other',
                contactPerson: '',
                phone: '',
                email: '',
                address: '',
                bankAccount: '',
                bankName: '',
            });
        }
    }, [vendor, reset]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={vendor ? 'Edit Vendor' : 'Tambah Vendor'}
            subtitle={vendor ? 'Perbarui data vendor' : 'Tambahkan vendor baru'}
            size="lg"
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nama Vendor"
                        placeholder="PT. Travel Indonesia"
                        required
                        icon={<Building2 className="w-4 h-4" />}
                        error={errors.name?.message}
                        {...register('name', { required: 'Nama vendor wajib diisi' })}
                    />
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tipe <span className="text-rose-400">*</span>
                        </label>
                        <select
                            className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 appearance-none"
                            {...register('type', { required: 'Tipe wajib dipilih' })}
                        >
                            <option value="airlines">Tiket Pesawat</option>
                            <option value="hotel">Hotel</option>
                            <option value="hotel_transit">Hotel Transit</option>
                            <option value="transport">Transport</option>
                            <option value="visa">Visa</option>
                            <option value="handling">Handling</option>
                            <option value="catering">Konsumsi</option>
                            <option value="manasik">Manasik</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>
                    <Input
                        label="Contact Person"
                        placeholder="Ahmad"
                        icon={<Building2 className="w-4 h-4" />}
                        {...register('contactPerson')}
                    />
                    <Input
                        label="Telepon"
                        placeholder="08123456789"
                        icon={<Phone className="w-4 h-4" />}
                        {...register('phone')}
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="vendor@email.com"
                        icon={<Mail className="w-4 h-4" />}
                        {...register('email')}
                    />
                    <Input
                        label="Nama Bank"
                        placeholder="Bank BCA"
                        {...register('bankName')}
                    />
                    <div className="md:col-span-2">
                        <Input
                            label="No. Rekening"
                            placeholder="1234567890"
                            {...register('bankAccount')}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Alamat
                        </label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/50 border border-surface-border text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 resize-none"
                            rows={3}
                            placeholder="Alamat vendor..."
                            {...register('address')}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                    <Button variant="secondary" onClick={onClose} type="button">
                        Batal
                    </Button>
                    <Button type="submit" loading={isLoading}>
                        {vendor ? 'Simpan Perubahan' : 'Tambah Vendor'}
                    </Button>
                </div>
            </form>
        </Modal >
    );
};

export default VendorManagement;
