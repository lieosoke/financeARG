import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import api from '../../../services/api';

const FloatingChatWindow = ({ conversation, currentUserId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const eventSourceRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (conversation) {
            fetchMessages();
            // Connect to chat events specifically for updates
            eventSourceRef.current = api.connectToChatEvents((eventType, data) => {
                if (eventType === 'new_message' && data.conversationId === conversation.id) {
                    setMessages(prev => [...prev, data.message]);
                    scrollToBottom();
                    if (data.message.senderId !== currentUserId) {
                        markAsRead(data.message.id);
                    }
                } else if (eventType === 'message_read' && data.conversationId === conversation.id) {
                    // Update read status locally
                    setMessages(prev => prev.map(msg =>
                        msg.senderId === currentUserId && !msg.isRead
                            ? { ...msg, isRead: true }
                            : msg
                    ));
                }
            });
        }
        return () => {
            eventSourceRef.current?.close();
        };
    }, [conversation]); // Re-run when conversation changes

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await api.getMessages(conversation.id);
            if (response.success) {
                setMessages(response.data);

                // Mark unread messages as read
                const unreadMessages = response.data.filter(
                    msg => msg.senderId !== currentUserId && !msg.isRead
                );
                if (unreadMessages.length > 0) {
                    unreadMessages.forEach(msg => markAsRead(msg.id));
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await api.markMessageAsRead(messageId);
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await api.sendMessage(conversation.id, newMessage);
            if (response.success) {
                setMessages(prev => [...prev, response.data]);
                setNewMessage('');
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUserId;
                        const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                    {!isMe && (
                                        <div className="w-6 h-6 flex-shrink-0">
                                            {showAvatar && (
                                                conversation.otherUser?.image ? (
                                                    <img src={conversation.otherUser.image} className="w-6 h-6 rounded-full" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[10px]">
                                                        {(conversation.otherUser?.name || '?').charAt(0)}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <div className={`
                                        relative px-3 py-2 rounded-2xl text-sm shadow-sm
                                        ${isMe
                                            ? 'bg-primary-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
                                        }
                                    `}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                                            <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                                            {isMe && (
                                                <span title={msg.isRead ? "Dibaca" : "Terkirim"}>
                                                    {msg.isRead ? (
                                                        <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                                    ) : (
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                                    )}
                                                </span>
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

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tulis pesan..."
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border-0 rounded-full text-sm focus:ring-1 focus:ring-primary-500 dark:text-white"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors flex-shrink-0"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

export default FloatingChatWindow;
