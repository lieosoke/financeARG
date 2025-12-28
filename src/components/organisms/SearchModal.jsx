import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, Package, Wallet, ArrowRight, Loader2, Command } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { formatCurrency } from '../../utils/formatters';

const SearchModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Fetch search results
    const { data: results, isLoading } = useSearch(debouncedQuery);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Build flat list of results for keyboard navigation
    const allResults = [
        ...(results?.jamaah?.map(item => ({ ...item, type: 'jamaah' })) || []),
        ...(results?.packages?.map(item => ({ ...item, type: 'package' })) || []),
        ...(results?.transactions?.map(item => ({ ...item, type: 'transaction' })) || []),
    ];

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && allResults[selectedIndex]) {
            e.preventDefault();
            handleResultClick(allResults[selectedIndex]);
        }
    }, [allResults, selectedIndex]);

    const handleResultClick = (result) => {
        onClose();
        if (result.type === 'jamaah') {
            navigate(`/jamaah/${result.id}`);
        } else if (result.type === 'package') {
            navigate(`/paket/${result.id}`);
        } else if (result.type === 'transaction') {
            navigate('/keuangan/cashflow');
        }
    };

    if (!isOpen) return null;

    const hasResults = allResults.length > 0;
    const showNoResults = debouncedQuery.length >= 2 && !isLoading && !hasResults;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50">
                <div className="bg-dark-secondary border border-surface-border rounded-2xl shadow-2xl overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 p-4 border-b border-surface-border">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Cari jamaah, paket, atau transaksi..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent text-white placeholder-gray-500 text-lg focus:outline-none"
                        />
                        {isLoading && <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-surface-glass transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto">
                        {/* Show hint when empty */}
                        {query.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-surface-glass rounded-2xl flex items-center justify-center">
                                    <Search className="w-8 h-8 text-gray-500" />
                                </div>
                                <p className="text-gray-400 mb-2">Ketik untuk mencari</p>
                                <p className="text-sm text-gray-600">Minimal 2 karakter</p>
                            </div>
                        )}

                        {/* Loading state */}
                        {query.length >= 2 && isLoading && (
                            <div className="p-8 text-center">
                                <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-4" />
                                <p className="text-gray-400">Mencari...</p>
                            </div>
                        )}

                        {/* No results */}
                        {showNoResults && (
                            <div className="p-8 text-center">
                                <p className="text-gray-400">Tidak ada hasil untuk "{debouncedQuery}"</p>
                            </div>
                        )}

                        {/* Results grouped by category */}
                        {hasResults && !isLoading && (
                            <div className="py-2">
                                {/* Jamaah Results */}
                                {results?.jamaah?.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Jamaah
                                        </div>
                                        {results.jamaah.map((item, idx) => {
                                            const globalIdx = idx;
                                            return (
                                                <button
                                                    key={`jamaah-${item.id}`}
                                                    onClick={() => handleResultClick({ ...item, type: 'jamaah' })}
                                                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-glass transition-colors ${selectedIndex === globalIdx ? 'bg-surface-glass' : ''
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium text-white truncate">{item.name}</p>
                                                        <p className="text-sm text-gray-500 truncate">{item.phone || item.nik || '-'}</p>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-600" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Package Results */}
                                {results?.packages?.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <Package className="w-4 h-4" /> Paket
                                        </div>
                                        {results.packages.map((item, idx) => {
                                            const globalIdx = (results?.jamaah?.length || 0) + idx;
                                            return (
                                                <button
                                                    key={`package-${item.id}`}
                                                    onClick={() => handleResultClick({ ...item, type: 'package' })}
                                                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-glass transition-colors ${selectedIndex === globalIdx ? 'bg-surface-glass' : ''
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-emerald-400" />
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium text-white truncate">{item.name}</p>
                                                        <p className="text-sm text-gray-500 truncate">{item.code} • {formatCurrency(parseFloat(item.pricePerPerson) || 0)}</p>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-600" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Transaction Results */}
                                {results?.transactions?.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <Wallet className="w-4 h-4" /> Transaksi
                                        </div>
                                        {results.transactions.map((item, idx) => {
                                            const globalIdx = (results?.jamaah?.length || 0) + (results?.packages?.length || 0) + idx;
                                            return (
                                                <button
                                                    key={`transaction-${item.id}`}
                                                    onClick={() => handleResultClick({ ...item, type: 'transaction' })}
                                                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-glass transition-colors ${selectedIndex === globalIdx ? 'bg-surface-glass' : ''
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'pemasukan' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                                                        }`}>
                                                        <Wallet className={`w-5 h-5 ${item.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                                                            }`} />
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium text-white truncate">
                                                            {item.jamaahName || item.vendorName || item.description || 'Transaksi'}
                                                        </p>
                                                        <p className={`text-sm font-semibold ${item.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                                                            }`}>
                                                            {item.type === 'pemasukan' ? '+' : '-'}{formatCurrency(parseFloat(item.amount) || 0)}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-600" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-surface-border bg-dark-tertiary/50 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-surface-glass border border-surface-border text-gray-400">↑</kbd>
                                <kbd className="px-1.5 py-0.5 rounded bg-surface-glass border border-surface-border text-gray-400">↓</kbd>
                                <span className="ml-1">Navigasi</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-surface-glass border border-surface-border text-gray-400">Enter</kbd>
                                <span className="ml-1">Pilih</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-surface-glass border border-surface-border text-gray-400">Esc</kbd>
                                <span className="ml-1">Tutup</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchModal;
