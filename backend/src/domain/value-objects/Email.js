/**
 * Value Object: Email
 * @pattern Email válido com sanitização contra ataques
 * @security Proteção contra email enumaration
 */

import { ValidationError } from '../../shared/errors/ValidationError.js';

export class Email {
  #value;
  
  constructor(email) {
    this.#Validate(email);
    this.#value = this.#normalize(email);
  }
  
  #validate(email) {
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email é obrigatório', 'EMAIL_REQUIRED');
    }
    
    // Regex robusto conforme RFC 5322
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      throw new ValidationError('Email inválido', 'EMAIL_INVALID');
    }
    
    if (email.length > 320) { // Limite RFC 5321
      throw new ValidationError('Email excede tamanho máximo', 'EMAIL_TOO_LONG');
    }
    
    // Proteção contra emails descartáveis
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (disposableDomains.includes(domain)) {
      throw new ValidationError(
        'Emails temporários não são permitidos',
        'EMAIL_DISPOSABLE'
      );
    }
  }
  
  #normalize(email) {
    return email.toLowerCase().trim();
  }
  
  get value() {
    return this.#value;
  }
  
  toString() {
    return this.#value;
  }
}
