/**
 * Schemas de validação para MFA
 */

import Joi from 'joi';

// Schema para confirmar setup e para validar no login
export const mfaTokenSchema = Joi.object({
    token: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
        'string.length': 'Código deve ter exatamente 6 dígitos',
        'string.pattern.base': 'Código deve conter apenas números',
        'any.required': 'Código MFA é obrigatório'
    })
});

// Schema para validação no login (token TOTP + mfaToken temporário)
export const mfaValidateSchema = Joi.object({
    token: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
        'string.length': 'Código deve ter exatamente 6 dígitos',
        'string.pattern.base': 'Código deve conter apenas números',
        'any.required': 'Código MFA é obrigatório'
    }),

    mfaToken: Joi.string().required().messages({
        'any.required': 'Token de sessão MFA é obrigatório'
    })
});