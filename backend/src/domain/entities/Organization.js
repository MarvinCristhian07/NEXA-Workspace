/**
 * Entity: Organization
 * @domain Entidade raiz do agregado Organization
 */

import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import { Document } from '../value-objects/Document.js';
import { config } from '../../config/environment.js';

export class Organization {
  constructor({ id, name, document, createdAt, updatedAt }) {
    this.id = id || uuidv4();
    this.setName(name);
    this.setDocument(document);
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  setName(name) {
    if (!name || typeof name !== 'string') {
      throw new ValidationError('Nome da organização é obrigatório', 'ORG_NAME_REQUIRED');
    }

    const trimmedName = name.trim();
    const { nameMinLength, organizationNameMaxLength } = config.validation;

    if (trimmedName.length < nameMinLength) {
      throw new ValidationError(
        `Nome deve ter no mínimo ${nameMinLength} caracteres`,
        'ORG_NAME_TOO_SHORT'
      );
    }

    if (trimmedName.length > organizationNameMaxLength) {
      throw new ValidationError(
        `Nome excede ${organizationNameMaxLength} caracteres`,
        'ORG_NAME_TOO_LONG'
      );
    }

    this.name = trimmedName;
  }

  setDocument(document) {
    this.document = new Document(document);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      document: this.document.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
