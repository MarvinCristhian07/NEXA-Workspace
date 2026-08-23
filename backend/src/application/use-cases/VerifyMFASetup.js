/**
 * Use Case: Confirmar Setup de MFA
 * 
 * @flow Usuário escaneia QR Code -> digita código -> MFA ativado
 * @security Valida código antes de ativar MFA
 * @security mfa_enabled só vira true após validação bem-sucedida
 */

import { TotpService } from "../../infrastructure/security/TotpService.js";
import { UserRepository } from "../../infrastructure/database/repositories/UserRepository.js";
import { AppError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/utils/logger.js";

export class VerifyMFASetup {
    static async execute({ userId, token }) {
        // Busca usuário com secret
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }

        // Verifica se há secret pendente
        if (!user.mfa_secret) {
            throw new AppError(
                'Setup MFA não iniciado. Chame /mfa/setup primeiro.',
                400,
                'MFA_SETUP_NOT_STARTED'
            );
        }

        // MFA já está ativo
        if (user.mfa_enabled) {
            throw new AppError('MFA já está ativo.', 409, 'MFA_ALREADY_ENABLED');
        }

        // Valida o código TOTP
        const isValid = TotpService.validateToken(token, user.mfa_secret);
        if (!isValid) {
            logger.warn(`Código MFA inválido durante setup: user=${userId}`);
            throw new AppError(
                'Código inválido. Verifique o horário do seu dispositivo.',
                401,
                'MFA_TOKEN_INVALID'
            );
        }

        // Ativa o MFA oficialmente
        await UserRepository.enableMFA(userId, user.mfa_secret);

        logger.info(`MFA ativado com sucesso: user=${userId}`);

        return {
            mfa_enabled: true,
            message: 'Autenticação de dois fatores ativada com sucesso'
        };
    }
}