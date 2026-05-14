/**
 * Repository: Organization
 * @pattern Repository Pattern para isolamento de persistência
 * @security Prepared statements para prevenir SQL Injection
 */

import { query, transaction } from '../../../config/database.js';
import { Organization } from '../../../domain/entities/Organization.js';
import { DatabaseError } from '../../../shared/errors/DatabaseError.js';
import { logger } from '../../../shared/utils/logger.js';

export class OrganizationRepository {
  /**
   * Cria nova organização
   * @param {Organization} organization - Entidade de organização
   * @returns {Promise<Organization>} Organização criada
   */
  static async create(organization) {
    const sql = `
      INSERT INTO organizations (id, name, document, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const params = [
      organization.id,
      organization.name,
      organization.document.value,
      organization.createdAt,
      organization.updatedAt
    ];
    
    try {
      const result = await query(sql, params);
      logger.info(`Organização criada: ${organization.id}`);
      return new Organization(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new DatabaseError(
          'CNPJ já cadastrado',
          'DUPLICATE_DOCUMENT',
          error
        );
      }
      throw new DatabaseError('Erro ao criar organização', 'DB_CREATE_ERROR', error);
    }
  }
  
  /**
   * Busca organização por CNPJ
   */
  static async findByDocument(document) {
    const sql = 'SELECT * FROM organizations WHERE document = $1';
    
    try {
      const result = await query(sql, [document]);
      return result.rows[0] ? new Organization(result.rows[0]) : null;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar organização', 'DB_FIND_ERROR', error);
    }
  }
  
  /**
   * Busca organização por ID
   */
  static async findById(id) {
    const sql = 'SELECT * FROM organizations WHERE id = $1';
    
    try {
      const result = await query(sql, [id]);
      return result.rows[0] ? new Organization(result.rows[0]) : null;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar organização', 'DB_FIND_ERROR', error);
    }
  }
}
