import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ChatContext = createContext(null);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeConversation, setActiveConversation] = useState(null);

    // Fetch initial unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const response = await api.getUnreadCount();
            if (response.success) {
                setUnreadCount(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [user]);

    // Setup SSE listener
    useEffect(() => {
        if (!user) return;

        fetchUnreadCount();

        const eventSource = api.connectToChatEvents((eventType, data) => {
            if (eventType === 'new_message' || eventType === 'message_read') {
                fetchUnreadCount();
            }

            // Auto open widget on new message if configured (optional, maybe distracting)
            // if (eventType === 'new_message') {
            //     // Optional: play sound
            // }
        });

        return () => {
            eventSource.close();
        };
    }, [user, fetchUnreadCount]);

    const toggleWidget = () => setIsWidgetOpen(prev => !prev);

    const openWidget = () => setIsWidgetOpen(true);

    const closeWidget = () => setIsWidgetOpen(false);

    const openChat = (conversation) => {
        setActiveConversation(conversation);
        setIsWidgetOpen(true);
    };

    const value = {
        isWidgetOpen,
        toggleWidget,
        openWidget,
        closeWidget,
        unreadCount,
        refreshUnreadCount: fetchUnreadCount,
        activeConversation,
        setActiveConversation,
        openChat
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;
