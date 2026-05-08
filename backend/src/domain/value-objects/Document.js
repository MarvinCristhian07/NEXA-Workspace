/**
 * Value Object: CNPJ
 * @validation Validação algorítmica completa de CNPJ
 * @security Sanitização contra SQL Injection
 */

import { ValidationError } from '../../shared/errors/ValidationError.js';

export class Document {
  #value;
  
  constructor(cnpj) {
    this.#validate(cnpj);
    this.#value = this.#normalize(cnpj);
  }
  
  #validate(cnpj) {
    if (!cnpj) {
      throw new ValidationError('CNPJ é obrigatório', 'CNPJ_REQUIRED');
    }
    
    // Remover caracteres não numéricos
    const digits = cnpj.replace(/\D/g, '');
    
    if (digits.length !== 14) {
      throw new ValidationError('CNPJ deve ter 14 dígitos', 'CNPJ_INVALID_LENGTH');
    }
    
    // Rejeitar CNPJs com todos dígitos iguais
    if (/^(\d)\1{13}$/.test(digits)) {
      throw new ValidationError('CNPJ inválido', 'CNPJ_INVALID_FORMAT');
    }
    
    // Validação dos dígitos verificadores
    if (!this.#validateCheckDigits(digits)) {
      throw new ValidationError('CNPJ inválido', 'CNPJ_INVALID_CHECK_DIGITS');
    }
  }
  
  #validateCheckDigits(cnpj) {
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    const calc = (base, weights) => {
      const sum = base.reduce((acc, digit, i) => acc + digit * weights[i], 0);
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };
    
    const digits = cnpj.split('').map(Number);
    const digit1 = calc(digits.slice(0, 12), weights1);
    const digit2 = calc(digits.slice(0, 13), weights2);
    
    return digit1 === digits[12] && digit2 === digits[13];
  }
  
  #normalize(cnpj) {
    return cnpj.replace(/\D/g, '');
  }
  
  get value() {
    return this.#value;
  }
  
  getFormatted() {
    const cnpj = this.#value;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
  }
  
  toString() {
    return this.#value;
  }
}
