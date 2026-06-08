/**
 * Controller: Autenticação (Login)
 * @layer Thin controller - delega para Use Case
 */

import { LoginDTO } from '../../application/dto/LoginDTO.js';
import { LoginUser } from '../../application/use-cases/LoginUser.js';
import { logger } from '../../shared/utils/logger.js';

export class AuthController {
    static async login(req, res, next) {
        try {
            const dto = LoginDTO.fromRequest(req.validatedBody);
            const result = await LoginUser.execute(dto);

            logger.info(`Login realizado com sucesso`);

            return res.status(200).json({
                success: true,
                message: 'Login realizado com sucesso',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}