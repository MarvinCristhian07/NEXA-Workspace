/**
 * Entity: User
 * @domain Entidade de usuário com regras de negócio
 */

import { v4 as uuidv4 } from 'uuid';
import { Email } from '../value-objects/Email.js';
import { Password } from '../value-objects/Password.js';

export class User {
  constructor({ id, email, password, mfaSecret, mfaEnabled, createdAt, updatedAt }) {
    this.id = id || uuidv4();
    this.setEmail(email);
    this.password = password;
    this.mfaSecret = mfaSecret || null;
    this.mfaEnabled = mfaEnabled || false;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  setEmail(email) {
    this.email = new Email(email);
  }

  setPassword(password) {
    new Password(password); 
    this.passwordPlainText = password;
  }

  enableMFA(secret) {
    this.mfaSecret = secret;
    this.mfaEnabled = true;
  }

  disableMFA() {
    this.mfaSecret = null;
    this.mfaEnabled = false;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email.value,
      mfaEnabled: this.mfaEnabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
