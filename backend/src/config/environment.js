/**
 * Configurações de Ambiente - NEXA Workspace
 * Centralização e validação de variáveis de ambiente
 * @security Fail-fast: sistema não inicia se variáveis críticas estiverem ausentes
 */

import dotenv from 'dotenv';
import { AppError } from '../shared/errors/AppError.js';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_MFA_TEMP_SECRET',
  'PASSWORD_PEPPER',
  'MFA_ENCRYPTION_KEY',
  'NODE_ENV',
  'PORT'
];

// Validação de variáveis críticas
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new AppError(
      `FATAL: Variável de ambiente ${varName} não configurada`,
      500,
      'CONFIG_ERROR'
    );
  }
});

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
    poolMin: 2,
    poolMax: 10,
    IdleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  },

  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtMfaTempSecret: process.env.JWT_MFA_TEMP_SECRET,
    jwtExpiresIn: '24h',
    jwtMfaTempExpiresIn: '5m',
    passwordPepper: process.env.PASSWORD_PEPPER,
    mfaEncryptionKey: process.env.MFA_ENCRYPTION_KEY,
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    rateLimitWindow: 15 * 60 * 1000,
    rateLimitMaxRequests: 100
  },

  validation: {
    passwordMinLength: 12,
    passwordMaxLength: 128,
    nameMinLength: 2,
    nameMaxLength: 255,
    organizationNameMaxLength: 255
  }
};
