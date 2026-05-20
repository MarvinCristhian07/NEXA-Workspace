/**
 * Middleware: Error Handler Global
 * @security Nunca expõe stack traces em produção
 * @logging Registra todos os error
 */

import { AppError } from '../../shared/errors/AppError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import { DatabaseError } from '../../shared/errors/DatabaseError.js';
import { logger } from '../../shared/utils/logger.js';
import { config } from '../../config/environment.js';

export const errorHandler = (err, req, res, next) => {
    // Log do erro
    logger.error('Error Handler:', {
        message: err.message,
        code: err.code,
        stack: config.env === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // Erros conhecidos
    if (err instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            error: {
                message: err.message,
                code: err.code,
                details: err.details
            }
        });
    }

    if (err instanceof DatabaseError) {
        return res.status(500).json({
            success: false,
            error: {
                message: 'Erro ao processar requisição',
                code: err.code
            }
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code
            }
        });
    }

    // Erro desconhecido
    res.status(500).json({
        success: false,
        error: {
            message: 'Erro interno do servidor',
            code: 'INTERNAL_SERVER_ERROR'
        }
    });
};