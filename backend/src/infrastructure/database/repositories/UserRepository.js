/**
 * Repository: User
 * @security Hash de senhas com PasswordHasher antes de persistir
 */

import { query } from '../../../config/database.js';
import { User } from '../../../domain/entities/User.js';
import { PasswordHasher } from '../../security/PasswordHasher.js';
import { DatabaseError } from '../../../shared/errors/DatabaseError.js';
import { logger } from '../../../shared/utils/logger.js';

export class UserRepository {
  /**
   * Cria novo usuário
   * @param {User} user - Entidade de usuário
   * @param {string} plainPassword - Senha em texto plano (será hasheada)
   * @returns {Promise<User>} Usuário criado
   */
  static async create(user, plainPassword) {
    const passwordHash = await PasswordHasher.hash(plainPassword);
    
    const sql = `
      INSERT INTO users (id, email, password_hash, mfa_secret, mfa_enabled, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, mfa_enabled, created_at, updated_at
    `;
    
    const params = [
      user.id,
      user.email.value,
      passwordHash,
      user.mfaSecret,
      user.createdAt,
      user.updatedAt
    ];
    
    try {
      const result = await query(sql, params);
      logger.info(`Usuário criado: ${user.id}`);
      return new User({ ...result.rows[0], password: passowrdHash });
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new DatabaseError(
          'Email já cadastrado',
          'DUPLICATE_EMAIL',
          error
        );
      }
      throw new DatabaseError('Erro ao criar usuário', 'DB_CREATE_ERROR', error);
    }
  }
  
  /**
   * Vincula usuário a organização
   */
  static async linkToOrganization(userId, organizationId, role = 'ADMIN') {
    const sql = `
      INSERT INTO organization_members (id, organization_id, user_id, role, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      RETURNING *
    `;
  }
}
