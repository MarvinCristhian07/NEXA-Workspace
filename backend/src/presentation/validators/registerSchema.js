/**
 * Schema de Validação - Joi
 * @layer Primeira camada de validação (pré-processamento)
 */

import Joi from 'joi';
import { config } from '../../config/environment.js';

export const registerSchema = Joi.object({
    organizationName: Joi.string()
        .min(config.validation.nameMinLength)
        .max(config.validation.organizationNameMaxLength)
        .trim()
        .required()
        .messages({
            'string.empty': 'Nome da organização é obrigatório',
            'string.min': `Nome deve ter no mínimo ${config.validation.nameMinLength} caracteres`,
            'string.max': `Nome deve ter no máximo ${config.validation.organizationNameMaxLength} caracteres`,
            'any.required': 'Nome da organização é obrigatório'
        }),

    cnpj: Joi.string()
      .pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)
      .required()
      .messages({
        'string.empty': 'CNPJ é obrigatório',
        'string.pattern.base': 'CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX ou 14 dígitos',
        'any.required': 'CNPJ é obrigatório'
      }),

    email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(320)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email é obrigatório',
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),

    password: Joi.string()
    .min(config.validation.passwordMinLength)
    .max(config.validation.passwordMaxLength)
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória',
      'string.min': `Senha deve ter no mínimo ${config.validation.passwordMinLength} caracteres`,
      'string.max': `Senha deve ter no máximo ${config.validation.passwordMaxLength} caracteres`,
      'any.required': 'Senha é obrigatória'
    })
});