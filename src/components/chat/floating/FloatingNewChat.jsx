import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const FloatingNewChat = ({ onSelectUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.getChatUsers();
                if (response.success) {
                    setUsers(response.data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    });

    const handleSelect = async (userId) => {
        if (creating) return;
        setCreating(true);
        try {
            await onSelectUser(userId);
        } catch (error) {
            console.error(error);
            setCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
            {/* Search */}
            <div className="p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari pengguna..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                        {searchQuery ? 'User tidak ditemukan' : 'Tidak ada user lain'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredUsers.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleSelect(user.id)}
                                disabled={creating}
                                className="w-full p-3 flex items-center gap-3 hover:bg-white dark:hover:bg-gray-700/50 transition-colors text-left disabled:opacity-50"
                            >
                                <div className="relative flex-shrink-0">
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name || 'User'}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user.name || user.email}
                                    </h4>
                                    {user.role && (
                                        <span className="inline-block text-[10px] px-1.5 py-0.5 mt-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded capitalize">
                                            {user.role}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingNewChat;
