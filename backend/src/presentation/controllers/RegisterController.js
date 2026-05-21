/**
 * Controller: Cadastro de Organização
 * @layer Thin controller - delega lógica para Use Case
 */

import { RegisterOrganizationDTO } from '../../application/dto/RegisterOrganizationDTO.js';
import { RegisterOrganization } from '../../application/use-cases/RegisterOrganization.js';
import { logger } from '../../shared/utils/logger.js';

export class RegisterController {
    static async handle(req, res, next) {
        try {
            const dto = RegisterOrganizationDTO.fromRequest(req.validatedBody);
            const result = await RegisterOrganization.execute(dto);

            logger.info(`Cadastro bem-sucedido: ${result.organization.id}`);

            return res.status(201).json({
                success: true,
                message: 'Organização cadastrada com sucesso',
                data: {
                    organization: {
                        id: result.organization.id,
                        name: result.organization.name,
                        document: result.organization.document
                    },
                    user: {
                        id: result.user.id,
                        email: result.user.email
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}