import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const FloatingConversationList = ({ conversations, loading, onSelect, currentUserId }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-6 text-center">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">Belum ada percakapan</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            {conversations.map((conv) => {
                const otherUser = conv.otherUser;
                const lastMessage = conv.lastMessage;
                const unreadCount = conv.unreadCount || 0;

                return (
                    <button
                        key={conv.id}
                        onClick={() => onSelect(conv)}
                        className="w-full p-3 flex items-start gap-3 hover:bg-white dark:hover:bg-gray-700/50 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                        <div className="relative flex-shrink-0">
                            {otherUser?.image ? (
                                <img
                                    src={otherUser.image}
                                    alt={otherUser.name || 'User'}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {(otherUser?.name || otherUser?.email || '?').charAt(0).toUpperCase()}
                                </div>
                            )}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-900 min-w-[1.25rem] text-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
                                    {otherUser?.name || otherUser?.email || 'User'}
                                </h4>
                                {lastMessage?.createdAt && (
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                            addSuffix: true,
                                            locale: idLocale,
                                        }).replace('yang lalu', '')}
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs truncate ${unreadCount > 0
                                    ? 'text-gray-800 dark:text-gray-200 font-medium'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {lastMessage ? (
                                    <>
                                        {lastMessage.senderId === currentUserId && 'Anda: '}
                                        {lastMessage.content}
                                    </>
                                ) : (
                                    <span className="italic">Mulai chat...</span>
                                )}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default FloatingConversationList;
