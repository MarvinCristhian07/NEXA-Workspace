/**
 * Use Case: Iniciar Setup de MFA
 * 
 * @flow Gera secret -> criptografa -> salva temp -> retorna QR Code
 * @security Secret salvo criptografado desde o início
 * @security QR Code gerado server-side, nunca exposto em URL
 */

import { TotpService } from '../../infrastructure/security/TotpService.js';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository.js';
import { AppError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

export class SetupMFA {
    static async execute({ userId }) {
        // Busca usuário
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }

        // Bloqueia re-setup se MFA já está ativo
        if (user.mfa_enabled) {
            throw new AppError(
                'MFA já está ativo. Desative antes de configurar novamente.',
                409,
                'MFA_ALREADY_ENABLED'
            );
        }

        // Gera secret e criptografa
        const secret = TotpService.generateSecret();
        const encryptedSecret = TotpService.encryptSecret(secret);

        // Salva secret temporário (mfa_enabled ainda é false)
        await UserRepository.saveMfaTempSecret(userId, encryptedSecret);

        // Gera QR Code
        const otpauthUrl = TotpService.generateOtpauthUrl(secret, user.email);
        const qrCodeDataUrl = await TotpService.generateQRCode(otpauthUrl);

        // Gera backup codes
        const backupCodes = TotpService.generateBackupCodes();

        logger.info(`MFA setup iniciado: user=${userId}`);

        return {
            qrCode: qrCodeDataUrl,      // Imagem PNG em base64 para exibir no frontend
            backupCodes,                // Mostrar uma vez - usuário deve salvar agora
            // secret não é retornado - usuário deve usar o QR Code
        };
    }
}