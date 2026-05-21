/**
 * Erro de operação de banco de dados
 */

import { AppError } from './AppError.js';

export class DatabaseError extends AppError {
  constructor(message, code = 'DB_ERROR', originalError = null) {
    super(message, 500, code);
    this.originalError = originalError;
  }
}
