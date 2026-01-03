import React, { useState, useRef, useEffect } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const ChatWindow = ({
    conversation,
    messages,
    loading,
    currentUserId,
    onSendMessage,
}) => {
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when conversation changes
    useEffect(() => {
        inputRef.current?.focus();
    }, [conversation?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await onSendMessage(newMessage);
            setNewMessage('');
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const formatMessageTime = (date) => {
        const d = new Date(date);
        if (isToday(d)) {
            return format(d, 'HH:mm');
        } else if (isYesterday(d)) {
            return 'Kemarin ' + format(d, 'HH:mm');
        } else {
            return format(d, 'd MMM HH:mm', { locale: idLocale });
        }
    };

    const otherUser = conversation?.otherUser;

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center gap-3">
                {otherUser?.image ? (
                    <img
                        src={otherUser.image}
                        alt={otherUser.name || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {(otherUser?.name || otherUser?.email || '?').charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {otherUser?.name || otherUser?.email || 'Unknown User'}
                    </h3>
                    {otherUser?.role && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {otherUser.role}
                        </span>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p>Mulai percakapan dengan mengirim pesan</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isOwn = message.senderId === currentUserId;
                        const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId);

                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar for other user */}
                                    {!isOwn && (
                                        <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                                            {otherUser?.image ? (
                                                <img
                                                    src={otherUser.image}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                                    {(otherUser?.name || otherUser?.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Message bubble */}
                                    <div
                                        className={`px-4 py-2 rounded-2xl ${isOwn
                                                ? 'bg-blue-600 text-white rounded-br-md'
                                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
                                            }`}>
                                            <span className="text-xs">{formatMessageTime(message.createdAt)}</span>
                                            {isOwn && (
                                                <svg
                                                    className={`w-4 h-4 ${message.isRead ? 'text-blue-200' : 'text-blue-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    {message.isRead ? (
                                                        <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                                    ) : (
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                    )}
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="flex-1 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
