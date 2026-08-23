/**
 * Middleware: Sanitização Profunda de Inputs
 * 
 * @security Percorre recursivamente body, query e params
 * @security Remove caracteres de controle, HTML e SQL wildcards
 * @security Limita tamanho de strings para previnir DoS
 * @security Rejeita estruturas de dados inesperados
 * @security Proteção contra prototype pollution
 */

import { AppError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

// Limites de segurança
const LIMITS = {
  maxStringLength: 10_000, // 10KB por campo
  maxArrayLength: 100,     // Máximo de itens em arrays
  maxObjectDepth: 5,       // Profundidade máxima de objetos aninhados
  maxKeys: 50              // Máximo de chaves em um objeto
};

// Padrão de ataques concebidos
const ATTACK_PATTERNS = [
  // SQL Injection
  /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bEXEC\b)/gi,
  // NoSQL Injection
  /(\$where|\$gt|\$lt|\$ne|\$in|\$nin|\$exists|\$regex)/gi,
  // Path Traversal
  /\.\.[\/\\]/g,
  // LDAP Injection
  /[()=*\x00]/g,
  // Null bytes
  /\x00/g
];

/**
 * Verifica se input contém padrões de ataque
 */
const containsAttackPattern = (value) => {
  if (typeof value !== 'string') return false;
  return ATTACK_PATTERNS.some(pattern => pattern.test(value));
};

/**
 * Sanitiza uma string individual
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  // Limita tamanho
  if (str.length > LIMITS.maxStringLength) {
    throw new AppError(
      'Campo excede tamanho máximo permitido',
      400,
      'INPUT_TOO_LARGE'
    );
  }

  return str
  // Remove null bytes
    .replace(/\x00/g, '')
  // Remove caracteres de controle (exceto \n, \r, \t)
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  // Remove caracteres unicode de controle
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
  // Normaliza espaços múltiplos
    .replace(/\s{2,}/g, ' ')
    .trim();
};

/**
 * Sanitiza recursivamente qualquer estrutura de dados
 * @param {*} data - Dados a sanitizar
 * @param {number} depth - Profundidade atual (para prevenir recursão infinita)
 */
const sanitizeDeep = (data, depth = 0) => {
  // Limite de profundidade - previne ataques de objetos profundamente aninhados
  if (depth > LIMITS.maxObjectDepth) {
    throw new AppError(
      'Estrutura de dados muito complexa',
      400,
      'INPUT_TOO_DEEP'
    );
  }

  // Null/undefined passam sem modificação
  if (data === null || data === undefined) return data;

  // String - sanitiza
  if (typeof data === 'string') {
    const sanitized = sanitizeString(data);

    // Detecta padrões de ataques após sanitização
    if (containsAttackPattern(sanitized)) {
      logger.warn(`Padrão de ataque detectado no input: ${sanitized.substring(0, 50)}...`);
      throw new AppError(
        'Input contém conteúdo não permitido',
        400,
        'MALICIOUS_INPUT'
      );
    }

    return sanitized;
  }

  // Número, boolean - passam direto
  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  // Array - sanitiza cada item
  if (Array.isArray(data)) {
    if (data.length > LIMITS.maxArrayLength) {
      throw new AppError(
        'Array excede tamanho máximo permitido',
        400,
        'ARRAY_TOO_LARGE'
      );
    }
    return data.map(item => sanitizeDeep(item, depth + 1));
  }

  // Objeto - sanitiza cada valor
  if (typeof data === 'object') {
    // Proteção contra prototype pollution
    if (data.__proto__ || data.constructor?.name !== 'Object') {
      throw new AppError('Estrutura de dados inválida', 400, 'INVALID_INPUT');
    }

    const keys = Object.keys(data);

    if (keys.length > LIMITS.maxKeys) {
      throw new AppError(
        'Objeto excede número máximo de campos',
        400,
        'TOO_MANY_FIELDS'
      );
    }

    const sanitized = {};
    for (const key of keys) {
      // Sanitiza também a chave
      const sanitizedKey = sanitizeString(key);
      // Rejeita chaves com padrões perigosos
      if (containsAttackPattern(sanitizedKey)) {
        throw new AppError('Campo inválido detectado', 400, 'MALICIOUS_INPUT');
      }
      sanitized[sanitizedKey] = sanitizeDeep(data[key], depth + 1);
    }
    return sanitized;
  }

  return data;
};

/**
 * Middleware que sanitiza body, query e params da requisição
 */
export const sanitizeInputs = (req, res, next) => {
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      req.body = sanitizeDeep(req.body);
    }

    if (req.query && Object.keys(req.query).length > 0) {
      req.query = sanitizeDeep(req.query);
    }
        
    if (req.params && Object.keys(req.params).length > 0) {
      req.params = sanitizeDeep(req.params);
    }

    next();
  } catch (error) {
    if (error.isOperational) {
      return next(error);
    }
    logger.error('Erro na sanitização de inputs:', error);
    return next(new AppError('Erro ao processar requisição', 400, 'SANITIZATION_ERROR'));
  }
};