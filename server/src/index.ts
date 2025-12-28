import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { auth } from './config/auth';
import { toNodeHandler } from 'better-auth/node';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);

            // Allow all localhost ports
            if (origin.match(/^http:\/\/localhost:\d+$/)) {
                return callback(null, true);
            }

            // Allow configured frontend URL
            const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
            if (origin === allowedOrigin) {
                return callback(null, true);
            }

            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
        next();
    });
}

// Better Auth handler - must be before other routes
app.all('/api/v1/auth/{*path}', toNodeHandler(auth));

// API Routes
app.use('/api/v1', routes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ARG Tour & Travel Finance API',
        version: '1.0.0',
        documentation: '/api/v1/health',
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 ARG Finance API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server:    http://localhost:${PORT}
📍 API:       http://localhost:${PORT}/api/v1
📍 Health:    http://localhost:${PORT}/api/v1/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
