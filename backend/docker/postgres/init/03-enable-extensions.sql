-- ==========================================
-- NEXA WORKSPACE - EXTENSIONS
-- Extensões para funcionalidades avançadas
-- ==========================================

\c nexa_workspace;

-- Full-text search (busca textual)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Estatísticas de queries (monitoramento de performance)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Funções de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT 'Extensões habilitadas com sucesso!' AS status;