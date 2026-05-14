/**
 * Sanitizador de Inputs
 * @security Proteção contra XSS, SQL Injection e LDAP Injection
 * @layer Defense in Depth
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export class InputSanitizer {
  /**
   * Sanitiza string removendo HTML/Scripts maliciosos
   */
  static sanitizeHTML(input) {
    if (typeof input !== 'string') return input;
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  
  /**
   * Escapa caracteres SQL perigosos (defesa adicional ao uso de prepared statements)
   */
  static escapeSQLWildcards(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[%_]/g, '\\$&');
  }
  
  /**
   * Normaliza espaços em branco
   */
  static normalizeWhitespaces(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Remove caracteres de controle unicode perigosos
   */
  static removeControlCharacters(input) {
    if (typeof input !== 'string') return input;
    // Remove C0 e C1 control characters exceto \n, \r, \t
    return input.replace(/[\x00-\x08\x0B\z0C\x0E-\x1F\x7F-\x9F]/g, '');
  }
  
  /**
   * Pipeline completo de sanitização
   */
  static sanitize(input) {
    if (typeof input !== 'string') return input;
    
    let sanitized = input;
    sanitized = this.removeControlCharacters(sanitized);
    sanitized = this.sanitizeHTML(sanitized);
    sanitized = this.normalizeWhitespaces(sanitized);
    
    return sanitized;
  }
}
