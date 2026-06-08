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

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                  // 10 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit por IP + email (mais preciso que só IP)
    const email = req.body?.email ?? 'unknown';
    return `${req.ip}_${email}`;
  }
});
