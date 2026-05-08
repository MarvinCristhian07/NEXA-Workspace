/**
 * Value Object: Password
 * @security Validação de força de senha baseada em OWASP
 * @pattern Múltiplos critérios de complexidade
 */

import { ValidationError } from '../../shared/errors/ValidationError.js';
import { config } from '../../config/environment.js';

export class Password {
  #value;
  
  constructor(password) {
    this.#validate(password);
    this.#value = password;
  }
  
  #validate(password) {
    if (!password || typeof password !== 'string') {
      throw new ValidationError('Senha é obrigatória', 'PASSWORD_REQUIRED');
    }
    
    const { passwordMinLength, passwordMaxLength } = config.validation;
    
    if (password.length < passwordMinLength) {
      throw new ValidationError(
        `Senha deve ter no mínimo ${passwordMinLength} caracteres`,
        'PASSWORD_TOO_SHORT'
      );
    }
    
    if (password.length > passwordMaxLength) {
      throw new ValidationError(
        `Senha excede tamanho máximo de ${passwordMaxLength} caracteres`,
        'PASSWORD_TOO_LONG'
      );
    }
    
    // Critérios de força (OWASP)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const criteriasMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (criteriasMet < 3) {
      throw new ValidationError(
        'Senha deve conter pelo menos 3 dos seguintes: maiúsculas, minúsculas, números, caracteres especiais',
        'PASSWORD_WEAK'
      );
    }
    
    // Lista de senhas comuns
    const commonPasswords = [
      'password', 'senha', '12345678', 'qwerty', 'abc123',
      '123abc', 'password123', '123password', 'senha123', '123abc',
      'admin', 'letmein', 'welcome', '123@abc', 'abc@123'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      throw new ValidationError(
        'Senha muito comum. Escolha uma senha mais forte',
        'PASSWORD_TOO_COMMON'
      );
    }
  }
  
  get Value() {
    return this.#value;
  }
}
