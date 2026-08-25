/**
 * NEXA Workspace - Backend Server
 * @security Middlewares aplicados em ordem específica de segurança
 */

import express from 'express';
import { config } from './src/config/environment.js';
import { securityHeaders } from './src/presentation/middlewares/securityHeaders.js';
import { corsMiddleware } from './src/presentation/middlewares/cors.js';
import { globalLimiter } from './src/presentation/middlewares/rateLimiter.js';
import { sanitizeInputs } from './src/presentation/middlewares/sanitizer.js';
import { errorHandler } from './src/presentation/middlewares/errorHandler.js';
import { swaggerUi, swaggerSpec, swaggerUiOptions } from './src/config/swagger.js';
import authRoutes from './src/presentation/routes/auth.routes.js';
import { logger } from './src/shared/utils/logger.js';

const app = express();

// CAMADA 1: Headers de segurança (primeiro de tudo)
app.use(securityHeaders);

// CAMADA 2: CORS (antes de qualquer parse de body)
app.use(corsMiddleware);

// CAMADA 3: Rate Limiting Global
app.use(globalLimiter);

// CAMADA 4: Parse de body (com limites de tamanho)
app.use(express.json({ limit: '1mb' }));  // Reduzido de 10mb para 1mb
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CAMADA 5: Sanitização de Inputs
app.use(sanitizeInputs);

// CAMADA 6: Request ID e Logging
app.use((req, res, next) => {
  // Gera ID único por requisição para rastreamento
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);

  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    requestId: req.requestId,
    userAgent: req.get('user-agent')
  });
  next();
});

// ROTAS
app.use('/api/auth', authRoutes);

// Documentação - disponível apenas fora de produção
if (config.env !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  logger.info(`📚 Documentação disponível em http://localhost:${config.port}/api/docs`);
}

// Health check (sem autenticação)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Rota não encontrada',
      code: 'NOT_FOUND'
    }
  });
});

// ERROR HANDLER (sempre o último)
app.use(errorHandler);

// START
app.listen(config.port, () => {
  logger.info(`🚀 NEXA Workspace rodando na porta ${config.port}`);
  logger.info(`📌 Ambiente: ${config.env}`);
  logger.info(`🛡️  Middlewares de segurança ativos`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando gracefully...');
  process.exit(0);
});

export default app;