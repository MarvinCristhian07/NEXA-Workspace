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
      user.id,          // $1
      user.email.value, // $2
      passwordHash,     // $3
      user.mfaSecret,   // $4
      user.mfaEnabled,  // $5 ← estava faltando
      user.createdAt,   // $6
      user.updatedAt    // $7
    ];

    try {
      const result = await query(sql, params);
      logger.info(`Usuário criado: ${user.id}`);
      return new User({ ...result.rows[0], password: passwordHash }); // ← typo corrigido
    } catch (error) {
      if (error.code === '23505') {
        throw new DatabaseError('Email já cadastrado', 'DUPLICATE_EMAIL', error);
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

    try {
      const result = await query(sql, [organizationId, userId, role]);
      logger.info(`Usuário ${userId} vinculado à organização ${organizationId}`);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new DatabaseError(
          'Usuário já vinculado a esta organização',
          'DUPLICATE_MEMBER',
          error
        );
      }
      throw new DatabaseError('Erro ao vincular usuário', 'DB_LINK_ERROR', error);
    }
  }
  
  /**
   * Busca usuário por email
   */
  static async findByEmail(email) {
    const sql = `
      SELECT id, email, password_hash, mfa_secret, mfa_enabled, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    try {
      const result = await query(sql, [email]);
      return result.rows[0] ?? null;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar usuário', 'DB_FIND_ERROR', error);
    }
  }

  /**
   * Busca o vínculo do usuário com sua organização
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object|null>} Dados de membership
   */
  static async findMembership(userId) {
    const sql = `
      SELECT
        om.organization_id,
        om.role,
        o.name AS organization_name
      FROM organization_members om
      INNER JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = $1
      LIMIT 1
    `;

    try {
      const result = await query(sql, [userId]);
      return result.rows[0] ?? null;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar membership', 'DB_FIND_ERROR', error);
    }
  }
}
