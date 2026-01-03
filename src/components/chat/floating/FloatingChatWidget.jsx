import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useChat } from '../../../contexts/ChatContext';
import api from '../../../services/api';
import FloatingConversationList from './FloatingConversationList';
import FloatingChatWindow from './FloatingChatWindow';
import FloatingNewChat from './FloatingNewChat';

const FloatingChatWidget = () => {
    const { user } = useAuth();
    const {
        isWidgetOpen,
        closeWidget,
        toggleWidget,
        activeConversation,
        setActiveConversation,
        unreadCount
    } = useChat();

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('list'); // 'list', 'chat', 'new_chat'
    const eventSourceRef = useRef(null);

    // Sync view with activeConversation
    useEffect(() => {
        if (activeConversation) {
            setView('chat');
        } else if (view === 'chat' && !activeConversation) {
            // If active conversation becomes null while in chat view, go back to list
            setView('list');
        }
    }, [activeConversation, view]);

    // Fetch conversations when widget opens or view is list
    useEffect(() => {
        if (isWidgetOpen && view === 'list') {
            fetchConversations();
        }
    }, [isWidgetOpen, view]);

    // Setup SSE for real-time updates inside widget
    useEffect(() => {
        if (!user) return;

        eventSourceRef.current = api.connectToChatEvents((eventType, data) => {
            if (eventType === 'new_message' || eventType === 'new_conversation') {
                if (isWidgetOpen && view === 'list') {
                    fetchConversations();
                }
            }
        });

        return () => {
            eventSourceRef.current?.close();
        };
    }, [user, isWidgetOpen, view]);

    const fetchConversations = async () => {
        setLoading(true);
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
    };

    const handleBack = () => {
        if (view === 'chat') {
            setActiveConversation(null); // This triggers useEffect -> setView('list')
        } else if (view === 'new_chat') {
            setView('list');
        }
    };

    const handleSelectUser = async (userId) => {
        try {
            const response = await api.createConversation(userId);
            if (response.success) {
                // First update the active conversation
                setActiveConversation(response.data);
                // Then fetch updated list in background
                fetchConversations();
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Widget Container */}
            <div
                className={`
                    w-[360px] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 
                    flex flex-col overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right
                    ${isWidgetOpen ? 'opacity-100 scale-100 translate-y-0 mb-4' : 'opacity-0 scale-90 translate-y-10 pointer-events-none h-0 mb-0'}
                `}
            >
                {/* Header */}
                <div className="h-14 px-4 bg-primary-600 dark:bg-primary-700 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {view !== 'list' && (
                            <button
                                onClick={handleBack}
                                className="text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <h3 className="text-white font-semibold text-lg">
                            {view === 'chat'
                                ? activeConversation?.otherUser?.name || 'Chat'
                                : view === 'new_chat' ? 'Chat Baru' : 'Messages'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1">
                        {view === 'list' && (
                            <button
                                onClick={() => setView('new_chat')}
                                className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                                title="New Chat"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={closeWidget}
                            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-gray-800">
                    {view === 'list' && (
                        <FloatingConversationList
                            conversations={conversations}
                            loading={loading}
                            onSelect={setActiveConversation}
                            currentUserId={user?.id}
                        />
                    )}
                    {view === 'chat' && (
                        <FloatingChatWindow
                            conversation={activeConversation}
                            currentUserId={user?.id}
                        />
                    )}
                    {view === 'new_chat' && (
                        <FloatingNewChat
                            onSelectUser={handleSelectUser}
                        />
                    )}
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={isWidgetOpen ? closeWidget : toggleWidget}
                className={`
                    w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95
                    ${isWidgetOpen
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rotate-90'
                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30'
                    }
                `}
            >
                {unreadCount > 0 && !isWidgetOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                {isWidgetOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default FloatingChatWidget;
