/**
 * JWT Service - Emissão e Verificação de Tokens
 * @security Tokens assinados com HS256, expiração configurável
 * @security Payload mínimo (sem dados sensíveis)
 */

import jwt from 'jsonwebtoken';
import { config } from '../../config/environment.js';
import { AppError } from '../../shared/errors/AppError.js';

export class JwtService {
  /**
     * Gera token de acesso
     * @param {Object} payload - Dados públicos do usuário
     * @returns {string} Token JWT assinado
     */
  static generateAccessToken(payload) {
    return jwt.sign(
      payload,
      config.security.jwtSecret,
      {
        expiresIn: config.security.jwtExpiresIn,
        issuer: 'nexa-workspace',
        audience: 'nexa-clients'
      }
    );
  }

  /**
     * Verifica e decodifica token
     * @param {string} token - Token JWT
     * @returns {Object} Payload decodificado
     */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.security.jwtSecret, {
        issuer: 'nexa-workspace',
        audience: 'nexa-clients'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expirado', 401, 'TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Token inválido', 401, 'TOKEN_INVALID');
      }
      throw new AppError('Erro de autenticação', 401, 'AUTH_ERROR');
    }
  }

  /**
   * Gera um token MFA temporário (válido por 5 minutos)
   * Emitido após login bem-sucedido quando MFA está ativo
   * Usando apenas para validar o código TOTP
   * @param {string} userId - ID do usuário
   * @returns {string} Token JWT temporário
   */
  static generateMfaTempToken(userId) {
    return jwt.sign(
      { sub: userId, type: 'mfa_pending' },
      config.security.jwtMfaTempSecret,
      {
        expiresIn: config.security.jwtMfaTempExpiresIn,
        issuer: 'nexa-workspace',
        audience: 'nexa-mfa'
      }
    );
  }

  /**
   * Verifica token MFA temporário
   * @param {string} token - Token temporário
   * @returns {Object} Payload decodificado
   */
  static verifyMfaTempToken(token) {
    try {
      const decoded = jwt.verify(token, config.security.jwtMfaTempSecret, {
        issuer: 'nexa-workspace',
        audience: 'nexa-mfa'
      });

      if (decoded.type !== 'mfa_pending') {
        throw new AppError('Token inválido', 401, 'TOKEN_INVALID');
      }

      return decoded;
    } catch (error) {
      if (error.isOperational) throw error;
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Sessão MFA expirada. Faça login novamente.', 401, 'MFA_TOKEN_EXPIRED');
      }
      throw new AppError('Token MFA inválido', 401, 'TOKEN_INVALID');
    }
  }
}