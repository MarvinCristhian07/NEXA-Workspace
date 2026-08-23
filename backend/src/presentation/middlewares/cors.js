/**
 * Middleware: CORS Restrito
 * 
 * @security Whitelist de origens - rejeita qualquer origem não autorizada
 * @security Métodos e Headers explicitamente definidos
 * @security Credentials permitido apenas para origens confiáveis
 * @security Preflight (OPTIONS) respondido automaticamente
 */

import cors from 'cors';
import { config } from '../../config/environment.js';
import { logger } from '../../shared/utils/logger.js';

// Mapa de origens permitidas por ambiente
const ALLOWED_ORIGINS = {
  development: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Vite (Frontend)
    'http://127.0.0.1:5173'
  ],
  production: [
    'https://app.nexaworkspace.com',
    'https://nexaworkspace.com'
  ],
  test: [
    'http://localhost:3000'
  ]
};

const allowedOrigins = ALLOWED_ORIGINS[config.env] ?? ALLOWED_ORIGINS.development;

const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Postman, curl, mobile apps)
    // Em produção, considerar remover essa permissão
    if (!origin) {
      if (config.env === 'production') {
        logger.warn('Requisição sem origin bloqueada em produção');
        return callback(new Error('Origem não permitida'), false);
      }
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn(`CORS bloqueado: origem não permitida - ${origin}`);
    return callback(new Error(`Origem não permitida pelo CORS: ${origin}`), false);
  },

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Headers que o cliente pode enviar
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',     // Para rastreamento de requisições
    'X-Requested-With'
  ],

  // Headers que o cliente pode ler na resposta
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],

  // Permite cookies/credentials entre origens
  credentials: true,

  // Cache do preflight por 24h (evita OPTIONS desnecessários)
  maxAge: 86400,

  // Responde automaticamente às requisições OPTIONS
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export const corsMiddleware = cors(corsOptions);