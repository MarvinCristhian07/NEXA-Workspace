/**
 * Use Case: Cadastro de Organização (Onboarding B2B)
 * @business Cria organização + primeiro usuário admin em transação atômica
 * @security Validações em múltiplas camadas (DTO, Entities, VOs)
 */

import { transaction } from '../../config/database.js';
import { Organization } from '../../domain/entities/Organization.js';
import { User } from '../../domain/entities/User.js';
import { OrganizationRepository } from '../../infrastructure/database/repositories/OrganizationRepository.js';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository.js';
import { InputSanitizer } from '../../infrastructure/security/InputSanitizer.js';
import { AppError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

export class RegisterOrganization {
  /**
   * Executa o cadastro completo
   * @param {RegisterOrganizationDTO} dto - Dados de entrada
   * @returns {Promise<Object>} Organização e usuário criados
   */
  static async execute(dto) {
    // Sanitização de inputs
    const sanitizedData = {
      organizationName: InputSanitizer.sanitize(dto.organizationName),
      cnpj: InputSanitizer.sanitize(dto.cnpj),
      email: InputSanitizer.sanitize(dto.email),
      password: dto.password
    };
    
    // Verificação de duplicidade antes da transação
    const [existingOrg, existingUser] = await Promise.all([
      OrganizationRepository.findByDocument(sanitizedData.cnpj),
      UserRepository.findByEmail(sanitizedData.email)
    ]);
    
    if (existingOrg) {
      throw new AppError('CNPJ já cadastrado', 409, 'DUPLICATE_CNPJ');
    }
    
    if (existingUser) {
      throw new AppError('Email já cadastrado', 409, 'DUPLICATE_EMAIL');
    }
    
    // Criação das entidades (validação ocorre nos construtores)
    const organization = new Organization({
      name: sanitizedData.organizationName,
      document: sanitizedData.ncpj
    });
    
    const user = new User({
      email: sanitizedData.email
    });
    
    // Transação atômica: cria org + usuário + vinculação
    try {
      const result = await transaction(async (client) => {
        // Cria organização
        const createdOrg = await OrganizationRepository.create(organization);
        
        // Cria usuário
        const createdUser = await UserRepository.create(user, sanitizedData.password);
        
        // Vincula como ADMIN
        await UserRepository.linkToOrganization(
          createdUser.id,
          createdOrg.id,
          'ADMIN'
        );
        
        return {
          organization: createdOrg.toJSON(),
          user: createdUser.toJSON()
        };
      });
      
      logger.info(`Onboarding concluído: Org ${result.organization.id}`);
      return result;
      
    } catch (error) {
      logger.error('Erro no onboarding:', error);
      throw error;
    }
  }
}
