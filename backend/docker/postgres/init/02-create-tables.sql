-- ==========================================
-- NEXA WORKSPACE - TABLES CREATION
-- Criação das tabelas iniciais do sistema
-- Baseado na modelagem do Marvin
-- ==========================================

\c nexa_workspace;

-- ==========================================
-- TABELA: organizations
-- ==========================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(18) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_organizations_document ON organizations(document);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at DESC);

-- Comentários (documentação no banco)
COMMENT ON TABLE organizations IS 'Tabela de organizações/empresas do sistema';
COMMENT ON COLUMN organizations.id IS 'Identificador único da organização (UUIDv4)';
COMMENT ON COLUMN organizations.name IS 'Nome completo da organização';
COMMENT ON COLUMN organizations.document IS 'CNPJ da organização (formato: XX.XXX.XXX/XXXX-XX)';

-- ==========================================
-- TABELA: users
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(320) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mfa_secret VARCHAR(255),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mfa_enabled ON users(mfa_enabled) WHERE mfa_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Comentários
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN users.id IS 'Identificador único do usuário (UUIDv4)';
COMMENT ON COLUMN users.email IS 'Email do usuário (usado para login)';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha (bcrypt + pepper)';
COMMENT ON COLUMN users.mfa_secret IS 'Chave secreta para autenticação multi-fator (TOTP)';
COMMENT ON COLUMN users.mfa_enabled IS 'Indica se MFA está ativado';

-- ==========================================
-- TABELA: organization_members
-- ==========================================
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint para evitar duplicação
    CONSTRAINT uq_orgm UNIQUE (organization_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);

-- Comentários
COMMENT ON TABLE organization_members IS 'Tabela de relacionamento entre usuários e organizações';
COMMENT ON COLUMN organization_members.role IS 'Papel do usuário na organização (ADMIN, MEMBER, GUEST)';
COMMENT ON CONSTRAINT uq_orgm ON organization_members IS 'Previne duplicação de membros';

-- ==========================================
-- ROW-LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS nas tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só veem dados da própria organização
CREATE POLICY organization_isolation ON organizations
    USING (id = current_setting('app.current_organization_id', TRUE)::UUID);

CREATE POLICY user_organization_isolation ON organization_members
    USING (organization_id = current_setting('app.current_organization_id', TRUE)::UUID);

-- ==========================================
-- TRIGGERS: updated_at automático
-- ==========================================

-- Função que atualiza o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para organizations
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- DADOS DE TESTE (SEED)
-- ==========================================

-- Inserir organização de teste
INSERT INTO organizations (id, name, document) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'NEXA Corporation (Teste)',
    '12.345.678/0001-90'
) ON CONFLICT DO NOTHING;

-- Inserir usuário de teste (senha: Test@123456)
INSERT INTO users (id, email, password_hash, mfa_enabled) 
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'teste@nexa.local',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5UpYPL5JJmMSK',
    FALSE
) ON CONFLICT DO NOTHING;

-- Vincular usuário à organização como ADMIN
INSERT INTO organization_members (organization_id, user_id, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'ADMIN'
) ON CONFLICT DO NOTHING;

-- Mensagem de sucesso
SELECT 'Tabelas criadas com sucesso! Dados de teste inseridos.' AS status;
SELECT 'Email: teste@nexa.local | Senha: Test@123456' AS credenciais_teste;