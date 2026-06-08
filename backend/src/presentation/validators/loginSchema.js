/**
 * Schema de Validação do Login - Joi
 * @security Validação mínima - não revela regras de negócio
 */

import Joi from 'joi';

export const loginSchema = Joi.object({
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
        .min(1)
        .max(128)
        .required()
        .messages({
            'string.empty': 'Senha é obrigatória',
            'any.required': 'Senha é obrigatória'
        })
});