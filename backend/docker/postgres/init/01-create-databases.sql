-- ==========================================
-- NEXA WORKSPACE - DATABASE INITIALIZATION
-- Criação de databases e configurações base
-- ==========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Database para testes (separado do desenvolvimento)
CREATE DATABASE nexa_workspace_test;

-- Conectar ao database principal
\c nexa_workspace;

-- Configurar timezone padrão
SET timezone = 'America/Sao_Paulo';

-- Mensagem de sucesso
SELECT 'Database nexa_workspace configurado com sucesso!' AS status;