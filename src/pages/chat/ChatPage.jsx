import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import NewChatModal from '../../components/chat/NewChatModal';

const ChatPage = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const eventSourceRef = useRef(null);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const response = await api.getConversations();
            if (response.success) {
                setConversations(response.data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages for selected conversation
    const fetchMessages = useCallback(async (conversationId) => {
        if (!conversationId) return;

        setMessagesLoading(true);
        try {
            const response = await api.getMessages(conversationId);
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setMessagesLoading(false);
        }
    }, []);

    // Setup SSE connection for real-time updates
    useEffect(() => {
        eventSourceRef.current = api.connectToChatEvents((eventType, data) => {
            switch (eventType) {
                case 'new_message':
                    // Update messages if the conversation is currently selected
                    if (selectedConversation?.id === data.conversationId) {
                        setMessages(prev => [...prev, data.message]);
                    }
                    // Refresh conversations to update unread count and last message
                    fetchConversations();
                    break;

                case 'message_sent':
                    // Update messages if this is from another tab/device
                    if (selectedConversation?.id === data.conversationId) {
                        setMessages(prev => {
                            const exists = prev.some(m => m.id === data.message.id);
                            if (exists) return prev;
                            return [...prev, data.message];
                        });
                    }
                    break;

                case 'new_conversation':
                    fetchConversations();
                    break;

                case 'message_read':
                    // Update message read status
                    setMessages(prev =>
                        prev.map(m =>
                            m.id === data.messageId ? { ...m, isRead: true } : m
                        )
                    );
                    break;

                default:
                    break;
            }
        });

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [selectedConversation?.id, fetchConversations]);

    // Initial fetch
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Fetch messages when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        } else {
            setMessages([]);
        }
    }, [selectedConversation, fetchMessages]);

    // Handle sending a message
    const handleSendMessage = async (content) => {
        if (!selectedConversation || !content.trim()) return;

        try {
            const response = await api.sendMessage(selectedConversation.id, content);
            if (response.success) {
                // Message will be added via SSE, but add immediately for better UX
                setMessages(prev => [...prev, response.data]);
                // Update conversation list
                fetchConversations();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Handle creating new conversation
    const handleCreateConversation = async (otherUserId) => {
        try {
            const response = await api.createConversation(otherUserId);
            if (response.success) {
                setShowNewChatModal(false);
                fetchConversations();
                setSelectedConversation(response.data);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    // Handle selecting a conversation
    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
    };

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            {/* Conversation List Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Chat</h2>
                    <button
                        onClick={() => setShowNewChatModal(true)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="New Chat"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Conversation List */}
                <ConversationList
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    onSelectConversation={handleSelectConversation}
                    loading={loading}
                    currentUserId={user?.id}
                />
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        loading={messagesLoading}
                        currentUserId={user?.id}
                        onSendMessage={handleSendMessage}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <div className="text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">Pilih percakapan atau mulai chat baru</p>
                        </div>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <NewChatModal
                    onClose={() => setShowNewChatModal(false)}
                    onCreateConversation={handleCreateConversation}
                />
            )}
        </div>
    );
};

export default ChatPage;
