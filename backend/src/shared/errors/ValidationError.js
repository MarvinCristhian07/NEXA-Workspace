/**
 * Erro de validação de dados
 */

import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR', details = []) {
    super(message, 400, code);
    this.details = details;
  }
}
