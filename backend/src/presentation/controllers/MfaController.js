/**
 * Controller: MFA
 */

import { SetupMFA } from '../../application/use-cases/SetupMFA.js';
import { VerifyMFASetup } from '../../application/use-cases/VerifyMFASetup.js';
import { ValidateMFA } from '../../application/use-cases/ValidateMFA.js';
import { MfaVerifySetupDTO, MfaValidateDTO } from '../../application/dto/MfaDTO.js';

export class MfaController {
    /**
     * GET /auth/mfa/setup
     * Inicia o setup - retorna QR Code e backup codes
     * @protected Requer JWT válido (usuário logado)
     */
    static async setup(req, res, next) {
        try {
            const result = await SetupMFA.execute({ userId: req.user.id });

            return res.status(200).json({
                success: true,
                message: 'Escaneie o QR Code com seu app autenticator. Salve os códigos de backup:',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /auth/mfa/verify-setup
     * Confirma setup - ativa MFA após validar primeiro código
     * @protected Requer JWT válido
     */
    static async verifySetup(req, res, next) {
        try {
            const dto = MfaVerifySetupDTO.fromRequest(req);
            const result = await VerifyMFASetup.execute(dto);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: { mfaEnabled: result.mfaEnabled }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /auth/mfa/validate
     * Validar código no login - retornar token definitivo
     * @public Usa mfaToken temporário (não requer JWT completo)
     */
    static async validate(req, res, next) {
        try {
            const dto = MfaValidateDTO.fromRequest(req.validatedBody);
            const result = await ValidateMFA.execute(dto);

            return res.status(200).json({
                success: true,
                message: 'Autenticação completa',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}