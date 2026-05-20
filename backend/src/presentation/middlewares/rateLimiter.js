/**
 *  Middleware: Rate Limiter
 * @security Proteção contra brute force e DDoS
 * @pattern Sliding window com Redis
 */

import rateLimit from 'express-rate-limit';
import { config } from '../../config/environment.js';

export const registerLimiter = rateLimit({
  windowMs: config.security.rateLimitWindow,
  max: 5, // Máximo 5 tentativas de cadastro em 15 minutos
  message: {
    error: 'Muitas tentativas de cadastro. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Identificação por IP
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});
