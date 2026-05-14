/**
 * Password Hasher - Bcrypt com Pepper
 * @security Bcrypt (custo 12) + Pepper global para camada extra
 * @performance Assíncrono para não bloquear event loop
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from '../../config/environment.js';

export class PasswordHasher {
  /**
   * Hash de senha com bcrypt + pepper
   * @param {string} plainPassword - Senha em texto plano
   * @returns {Promise<string> Hash da senha}
   */
  static async hash(plainPassword) {
    // Adiciona pepper antes do bcrypt para camada extra de segurança
    const pepperedPassword = crypto
      .createHmac('sha256', config.security.passwordPepper)
      .update(plainPassword)
      .digest('hex');
    
    return bcrypt.hash(pepperedPassword, config.security.bcryptRounds);
  }
  
  /**
   * Verifica senha contra hash
   * @param {string} plainPassword - Senha fornecida
   * @param {string} hashedPassword - Hash armazenado
   * @returns {Promise<boolean>} True se senha correta
   */
  static async verify(plainPassword, hashedPassword) {
    const pepperedPassword = crypto
      .createHmac('sha256', config.security.passwordPepper)
      .update(plainPassword)
      .digest('hex');
    
    return bcrypt.compare(pepperedPassword, hashedPassword);
  }
}
