import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const ConversationList = ({
    conversations,
    selectedConversation,
    onSelectConversation,
    loading,
    currentUserId,
}) => {
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Belum ada percakapan</p>
                    <p className="text-sm mt-1">Klik + untuk memulai chat baru</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const otherUser = conv.otherUser;
                const lastMessage = conv.lastMessage;
                const unreadCount = conv.unreadCount || 0;

                return (
                    <button
                        key={conv.id}
                        onClick={() => onSelectConversation(conv)}
                        className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-600' : ''
                            }`}
                    >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {otherUser?.image ? (
                                <img
                                    src={otherUser.image}
                                    alt={otherUser.name || 'User'}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                                    {(otherUser?.name || otherUser?.email || '?').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className={`font-medium truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {otherUser?.name || otherUser?.email || 'Unknown User'}
                                </h3>
                                {lastMessage?.createdAt && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                            addSuffix: true,
                                            locale: idLocale,
                                        })}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <p className={`text-sm truncate ${unreadCount > 0
                                        ? 'text-gray-900 dark:text-white font-medium'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {lastMessage ? (
                                        <>
                                            {lastMessage.senderId === currentUserId && (
                                                <span className="text-gray-400 dark:text-gray-500">Anda: </span>
                                            )}
                                            {lastMessage.content}
                                        </>
                                    ) : (
                                        <span className="italic">Belum ada pesan</span>
                                    )}
                                </p>
                                {unreadCount > 0 && (
                                    <span className="flex-shrink-0 ml-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default ConversationList;
