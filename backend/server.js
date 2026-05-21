/**
 * NEXA Workspace - Backend Server
 * @architecture Clean Architecture + DDD
 * @security Enterprise-grade security layers
 */

import express from 'express'
import cors from 'cors';
import { config } from './src/config/environment.js';
import { securityHeaders } from './src/presentation/middlewares/securityHeaders.js';
import { errorHandler } from './src/presentation/middlewares/errorHandler.js';
import authRoutes from './src/presentation/routes/auth.routes.js';
import { logger } from './src/shared/utils/logger.js';
import { timeStamp } from 'node:console';

const app = express();

// MIDDLEWARES GLOBAIS
app.use(cors({
    origin: config.env === 'production'
      ? 'https://app.nexaworkspace.com'
      : 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Rotas
app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Rota não encontrada',
            code: 'NOT_FOUND'
        }
    });
});

// Error Handler
app.use(errorHandler);

// START SERVER
app.listen(config.port, () => {
    logger.info(`🚀 NEXA Workspace rodando na porta ${config.port}`);
    logger.info(`📌 Ambiente: ${config.env}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM recebido. Encerrando gracefully...');
    process.exit(0);
});

export default app;