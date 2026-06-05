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
}