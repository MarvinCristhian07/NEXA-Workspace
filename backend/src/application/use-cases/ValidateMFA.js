/**
 * Use Case: Validar Código MFA no login
 * 
 * @flow Login -> mfaToken temp -> validar TOTP - accessToken definitivo
 * @security mfaToken temporário assinado com secret separado
 * @security Token definitivo só emitido após TOTP válido
 */

import { TotpService } from "../../infrastructure/security/TotpService.js";
import { JwtService } from "../../infrastructure/security/JwtService.js";
import { UserRepository } from "../../infrastructure/database/repositories/UserRepository.js";
import { AppError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/utils/logger.js";
import { User } from "../../domain/entities/User.js";

export class ValidateMFA {
    static async execute({ mfaToken, token }) {
        // Verifica token MFA temporário
        const decoded = JwtService.verifyMfaTempToken(mfaToken);
        const userId = decoded.sub;

        // Buscar usuário
        const user = await UserRepository.findById(userId);
        if (!user || !user.mfa_enabled || !user.mfa_secret) {
            throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
        }

        // Validar código TOTP
        const isValid = TotpService.validateToken(token, user.mfa_secret);
        if (!isValid) {
            logger.warn(`Falha na validação MFA no login: user=${userId}`);
            throw new AppError(
                'Código MFA inválido ou expirado',
                401,
                'MFA_TOKEN_INVALID'
            );
        }

        // Buscar membership para montar payload completo
        const membership = await UserRepository.findMembership(userId);
        if (!membership) {
            throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
        }

        // Emitir token definitivo
        const accessToken = JwtService.generateAccessToken({
            sub: user.id,
            orgId: membership.organization_id,
            role: membership.role,
            email: user.email
        });

        logger.info(`Login com MFA bem-sucedido: user=${userId}`);

        return {
            accessToken,
            expiresIn: '24h',
            user: {
                id: user.id,
                email: user.email,
                role: membership.role,
                mfaEnabled: true,
                organizationId: membership.organization_id
            }
        };
    }
}