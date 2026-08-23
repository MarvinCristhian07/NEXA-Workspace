/**
 * Middleware: Autenticação JWT
 * 
 * @security Verifica assinatura, expiração, issuer e audience do token
 * @security Extrai apenas do header Authorization (Bearer scheme)
 * @security Nunca expõe detalhes do erro de token para o cliente
 * @security Anexa payload ao req.user para uso nas rotas protegidas
 */

import { JwtService } from '../../infrastructure/security/JwtService.js';
import { AppError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

/**
 * Middleware obrigatório - bloqueia requisição se token inválido
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // Verifica presença do header
    if (!authHeader) {
      throw new AppError('Token de acesso não fornecido', 401, 'TOKEN_MISSING');
    }

    // Verifica formato Bearer
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new AppError('Formato de token inválido. Use: Bearer <token>', 401, 'TOKEN_FORMAT_INVALID');
    }

    const token = parts[1];

    // Verifica se token não está vazio
    if (!token || token.trim() == '') {
      throw new AppError('Token de acesso não fornecido', 401, 'TOKEN_MISSING');
    }

    // Verifica e decodifica o token
    const decoded = JwtService.verifyToken(token);

    // Valida campos mínimos obrigatórios no payload
    if (!decoded.sub || !decoded.orgId || !decoded.role) {
      throw new AppError('Token malformado', 401, 'TOKEN_MALFORMED');
    }

    // Anexa dados do usuário à requisição (disponível em todos os handlers seguintes)
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      organizationId: decoded.orgId,
      role: decoded.role
    };

    logger.info(`Autenticado: user=${req.user.id} org=${req.user.organizationId}`);
    next();

  } catch (error) {
    // Repassa erros conhecidos (AppError do JwtService)
    if (error.isOperational) {
      return next(error);
    }
    // Erro inesperado - não expõe detalhes
    logger.error('Erro inesperado na autenticação:', error);
    return next(new AppError('Erro de autenticação', 401, 'AUTH_ERROR'));
  }
};

/**
 * Middleware opcional - permite requisição mesmo sem token
 * Útil para rotas que têm comportamento diferente para logados/não-logados
 */
export const authenticateOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    req.user = null;
    return next();
  }

  // Reutiliza o middleware obrigatório
  authenticate(req, res, next);
};