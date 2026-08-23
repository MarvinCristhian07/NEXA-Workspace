/**
 * Use Case: Login de Usuário
 *
 * @security Timing-safe: mesmo tempo de resposta para email
 *           inexistente e senha errada — impede enumeração de usuários
 * @security Nunca revela se o erro foi no email ou na senha (HTTP 401 genérico)
 * @security Bcrypt comparison sempre executada para evitar timing attacks
 */

import { UserRepository } from '../../infrastructure/database/repositories/UserRepository.js';
import { OrganizationRepository } from '../../infrastructure/database/repositories/OrganizationRepository.js';
import { PasswordHasher } from '../../infrastructure/security/PasswordHasher.js';
import { JwtService } from '../../infrastructure/security/JwtService.js';
import { InputSanitizer } from '../../infrastructure/security/InputSanitizer.js';
import { AppError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

// Senha dummy para executar bcrypt mesmo quando usuário não existe
// Previne timing attacks por diferença de tempo de resposta
const DUMMY_HASH = '$2b$12$KIXdWmDL9KyXfBPGIPRYMu7nZBv3bQh8KHBgNfYW5kfUaQmUJpWfK';

export class LoginUser {
  /**
   * Executa o login
   * @param {LoginDTO} dto - Dados de entrada
   * @returns {Promise<Object>} Token JWT e dados do usuário
   */
  static async execute(dto) {
    // 1. Sanitização
    const email = InputSanitizer.sanitize(dto.email)?.toLowerCase().trim();
    const { password } = dto;

    // 2. Busca usuário (sem revelar se existe ou não)
    const user = await UserRepository.findByEmail(email);

    // 3. Sempre executa o hash comparison (timing-safe)
    // Se usuário não existe, compara com hash dummy — garante mesmo tempo de resposta
    const hashToCompare = user?.password_hash ?? DUMMY_HASH;
    const isPasswordValid = await PasswordHasher.verify(password, hashToCompare);

    // 4. Rejeita se usuário não existe OU senha errada — mesma mensagem para ambos
    if (!user || !isPasswordValid) {
      logger.warn(`Tentativa de login falhou para: ${email}`);
      throw new AppError(
        'Credenciais inválidas',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    if (user.mfa_enabled) {
      // Emite token temporário, válido por 5 minutos, para validar MFA
      const mfaToken = JwtService.generateMfaTempToken(user.id);

      logger.info(`Login parcial - MFA requerido: user=${user.id}`);

      return {
        mfaRequired: true,
        mfaToken,
        expiresIn: '5m'
      };
    }

    // 5. Busca organização do usuário
    const membership = await UserRepository.findMembership(user.id);
    if (!membership) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    // 6. Monta payload mínimo do JWT (nunca incluir senha, mfa_secret, etc.)
    const tokenPayload = {
      sub: user.id,                        // Subject: ID do usuário
      orgId: membership.organization_id,   // ID da organização
      role: membership.role,               // Papel do usuário
      email: user.email                    // Email (para display)
    };

    // 7. Gera token
    const accessToken = JwtService.generateAccessToken(tokenPayload);
    logger.info(`Login bem-sucedido (sem MFA): user=${user.id}`);

    return {
      mfaRequired: false,
      accessToken,
      expiresIn: '24h',
      user: {
        id: user.id,
        email: user.email,
        role: membership.role,
        mfaEnabled: false,
        organizationId: membership.organization_id
      }
    };
  }
}