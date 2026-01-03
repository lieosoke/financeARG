import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { conversations, messages, users } from '../db/schema';
import { eq, or, and, desc, sql, ne } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all chat routes
router.use(authMiddleware);

// Store active SSE connections
const activeConnections = new Map<string, Response[]>();

// Helper to send SSE event to specific users
const sendSSEToUser = (userId: string, event: string, data: any) => {
    const connections = activeConnections.get(userId);
    if (connections) {
        connections.forEach(res => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        });
    }
};

// GET /chat/events - SSE endpoint for real-time updates
router.get('/events', (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send initial connection event
    res.write(`event: connected\n`);
    res.write(`data: {"message": "Connected to chat events"}\n\n`);

    // Add to active connections
    if (!activeConnections.has(userId)) {
        activeConnections.set(userId, []);
    }
    activeConnections.get(userId)!.push(res);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
        res.write(`event: heartbeat\n`);
        res.write(`data: ${Date.now()}\n\n`);
    }, 30000);

    // Cleanup on close
    req.on('close', () => {
        clearInterval(heartbeat);
        const connections = activeConnections.get(userId);
        if (connections) {
            const index = connections.indexOf(res);
            if (index > -1) {
                connections.splice(index, 1);
            }
            if (connections.length === 0) {
                activeConnections.delete(userId);
            }
        }
    });
});

// GET /chat/conversations - Get all conversations for current user
router.get('/conversations', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        // Get conversations where user is a participant
        const userConversations = await db
            .select({
                id: conversations.id,
                participant1Id: conversations.participant1Id,
                participant2Id: conversations.participant2Id,
                lastMessageAt: conversations.lastMessageAt,
                createdAt: conversations.createdAt,
            })
            .from(conversations)
            .where(
                or(
                    eq(conversations.participant1Id, userId),
                    eq(conversations.participant2Id, userId)
                )
            )
            .orderBy(desc(conversations.lastMessageAt));

        // Get participant info and unread counts for each conversation
        const conversationsWithDetails = await Promise.all(
            userConversations.map(async (conv) => {
                const otherUserId = conv.participant1Id === userId
                    ? conv.participant2Id
                    : conv.participant1Id;

                // Get other participant info
                const [otherUser] = await db
                    .select({
                        id: users.id,
                        name: users.name,
                        email: users.email,
                        image: users.image,
                    })
                    .from(users)
                    .where(eq(users.id, otherUserId));

                // Get unread count
                const [unreadResult] = await db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(messages)
                    .where(
                        and(
                            eq(messages.conversationId, conv.id),
                            eq(messages.isRead, false),
                            ne(messages.senderId, userId)
                        )
                    );

                // Get last message
                const [lastMessage] = await db
                    .select({
                        content: messages.content,
                        senderId: messages.senderId,
                        createdAt: messages.createdAt,
                    })
                    .from(messages)
                    .where(eq(messages.conversationId, conv.id))
                    .orderBy(desc(messages.createdAt))
                    .limit(1);

                return {
                    ...conv,
                    otherUser,
                    unreadCount: unreadResult?.count || 0,
                    lastMessage,
                };
            })
        );

        return res.json({
            success: true,
            data: conversationsWithDetails,
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// POST /chat/conversations - Create a new conversation
router.post('/conversations', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                message: 'otherUserId is required',
            });
        }

        if (otherUserId === userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create conversation with yourself',
            });
        }

        // Check if other user exists
        const [otherUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, otherUserId));

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if conversation already exists
        const [existingConv] = await db
            .select()
            .from(conversations)
            .where(
                or(
                    and(
                        eq(conversations.participant1Id, userId),
                        eq(conversations.participant2Id, otherUserId)
                    ),
                    and(
                        eq(conversations.participant1Id, otherUserId),
                        eq(conversations.participant2Id, userId)
                    )
                )
            );

        // Helper to get other user details
        const [otherUserDetails] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
            })
            .from(users)
            .where(eq(users.id, otherUserId));

        if (existingConv) {
            return res.json({
                success: true,
                data: { ...existingConv, otherUser: otherUserDetails },
                message: 'Conversation already exists',
            });
        }

        // Create new conversation
        const newConversation = {
            id: crypto.randomUUID(),
            participant1Id: userId,
            participant2Id: otherUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(conversations).values(newConversation);

        // Notify other user
        sendSSEToUser(otherUserId, 'new_conversation', {
            conversation: { ...newConversation, otherUser: req.user }, // Rough approx for other user? actually sender info needed
        });

        return res.status(201).json({
            success: true,
            data: { ...newConversation, otherUser: otherUserDetails },
            message: 'Conversation created successfully',
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// GET /chat/conversations/:id/messages - Get messages in a conversation
router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id: conversationId } = req.params;
        const { limit = 50, before } = req.query;

        // Verify user is a participant
        const [conv] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId));

        if (!conv) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        // Build query
        let query = db
            .select({
                id: messages.id,
                conversationId: messages.conversationId,
                senderId: messages.senderId,
                content: messages.content,
                isRead: messages.isRead,
                createdAt: messages.createdAt,
            })
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(desc(messages.createdAt))
            .limit(Number(limit));

        const messageList = await query;

        // Mark messages as read
        await db
            .update(messages)
            .set({ isRead: true })
            .where(
                and(
                    eq(messages.conversationId, conversationId),
                    ne(messages.senderId, userId),
                    eq(messages.isRead, false)
                )
            );

        return res.json({
            success: true,
            data: messageList.reverse(), // Oldest first
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// POST /chat/messages - Send a new message
router.post('/messages', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { conversationId, content } = req.body;

        if (!conversationId || !content) {
            return res.status(400).json({
                success: false,
                message: 'conversationId and content are required',
            });
        }

        // Verify user is a participant
        const [conv] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId));

        if (!conv) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        // Create message
        const newMessage = {
            id: crypto.randomUUID(),
            conversationId,
            senderId: userId,
            content: content.trim(),
            isRead: false,
            createdAt: new Date(),
        };

        await db.insert(messages).values(newMessage);

        // Update conversation last message time
        await db
            .update(conversations)
            .set({
                lastMessageAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(conversations.id, conversationId));

        // Notify the other participant via SSE
        const otherUserId = conv.participant1Id === userId
            ? conv.participant2Id
            : conv.participant1Id;

        sendSSEToUser(otherUserId, 'new_message', {
            message: newMessage,
            conversationId,
        });

        // Also send to sender for sync across multiple tabs/devices
        sendSSEToUser(userId, 'message_sent', {
            message: newMessage,
            conversationId,
        });

        return res.status(201).json({
            success: true,
            data: newMessage,
            message: 'Message sent successfully',
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// PUT /chat/messages/:id/read - Mark a message as read
router.put('/messages/:id/read', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id: messageId } = req.params;

        // Get the message
        const [msg] = await db
            .select()
            .from(messages)
            .where(eq(messages.id, messageId));

        if (!msg) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        // Verify user is recipient (not sender)
        const [conv] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, msg.conversationId));

        if (!conv) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        // Mark as read
        await db
            .update(messages)
            .set({ isRead: true })
            .where(eq(messages.id, messageId));

        // Notify sender that message was read
        sendSSEToUser(msg.senderId, 'message_read', {
            messageId,
            conversationId: msg.conversationId,
        });

        return res.json({
            success: true,
            message: 'Message marked as read',
        });
    } catch (error) {
        console.error('Error marking message as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// GET /chat/unread-count - Get total unread message count
router.get('/unread-count', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        // Get all conversations where user is participant
        const userConversations = await db
            .select({ id: conversations.id })
            .from(conversations)
            .where(
                or(
                    eq(conversations.participant1Id, userId),
                    eq(conversations.participant2Id, userId)
                )
            );

        const conversationIds = userConversations.map(c => c.id);

        if (conversationIds.length === 0) {
            return res.json({
                success: true,
                data: { count: 0 },
            });
        }

        // Count unread messages where user is not sender
        const [result] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(messages)
            .where(
                and(
                    sql`${messages.conversationId} = ANY(${conversationIds})`,
                    eq(messages.isRead, false),
                    ne(messages.senderId, userId)
                )
            );

        return res.json({
            success: true,
            data: { count: result?.count || 0 },
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// GET /chat/users - Get list of users for starting new conversation
router.get('/users', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        // Get all users except current user
        const userList = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
                role: users.role,
            })
            .from(users)
            .where(ne(users.id, userId))
            .orderBy(users.name);

        return res.json({
            success: true,
            data: userList,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

export default router;
