/**
 * Configuração do Pool de Conexões PostgreSQL
 * @security Connection pooling com limites definidos
 * @performance Pool reutilizável para alta concorrência
 */

import pg from 'pg';
import { config } from './environment.js';
import { logger } from '../shared/utils/logger.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  min: config.database.poolMin,
  max: config.database.poolMax,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis
});

// Event listeners para monitoramento
pool.on('connect', () => {
  logger.info('Nova conexão estabelecida com o banco de dados');
});

pool.on('error', (err) => {
  logger.error('Erro inesperado no pool de conexões', err);
});

/**
 * Executar queries com Row-Level Security (RLS) habilitado
 * @param {string} text - Query SQL
 * @param {Array} params - Parâmetros da query
 * @param {string} organizationId - ID da organização para RLS
 */
export const query = async (text, params = [], organizationId = null) => {
  const client = await pool.connect();
  
  try {
    // Se fornecer o organizationId, setar variável de sessão para RLS
    if (organizationId) {
      await client.query(
        'SET LOCAL app.current_organization_id = $1',
        [organizationId]
      );
    }
    
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

/**
 * Executar transação com rollback automático em caso de erro
 */
export const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
