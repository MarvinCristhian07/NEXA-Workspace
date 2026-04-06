# Documentação do Banco de Dados - Marvin
## 1. Metadados e Contexto
<b>Módulo:</b> IAM (Identify and Access Management) <br>
<b>Task:</b> 3.1 - Modelagem de Tabelas Iniciais e RLS <br>
<b>Responsável:</b> Marvin <br>
<b>Objetivo:</b> Estabelecer a fundação e isolamento Multi-Tenant (RLS) e a estrutura relacional entre empresa e usuários.

## 2. Visão Arquitetural
<b>Motor:</b> PostgreSQL. <br>
<b>Chaves Primárias:</b> Utilização de UUIDv4 para segurança contra enumeração. <br>
<b>Segurança:</b> Implementação de Row-Level Security (RLS) baseada no ```organization_id```. <br>
<b>Rastreabilidade:</b> Colunas ```created_at```, ```updated_at``` do tipo ```TIMESTAMPTZ``` em todas as tabelas.

## 3. Dicionário de Dados e Estruturas
### Tabela ```organizations```
|   Coluna   | Tipo de Dado |  Constraints  |                                             Descrição                                             |
| :--------: | :----------: | :-----------: | :-----------------------------------------------------------------------------------------------: |
|     id     |     UUID     |       PK      |       Identificação única da empresa/organização, escolha do UUID pela segurança e unicidade      |
|    name    |    VARCHAR   |    NOT NULL   |                                Nome completo da organização/empresa                               |
|  document  |    VARCHAR   |     UNIQUE    |                                     documento CNPJ da empresa                                     |
| created_at |  TIMESTAMPTZ | DEFAULT NOW() | Data do registro da empresa no sistema. Uso do TIMESTAMPTZ para precisão na coleta de data e hora |
| updated_at |  TIMESTAMPTZ | DEFAULT NOW() |            Data de atualização de dados e informações do registro da empresa no sistema           |

<br>

### Tabela ```users```
|      Coluna     | Tipo de Dado |   Constraints   |                                            Descrição                                              |
| :-------------: | :----------: | :-------------: | :-----------------------------------------------------------------------------------------------: |
|        id       |     UUID     |        PK       |             Identificação única do usuário, escolha do UUID pela segurança e unicidade            |
|      email      |    VARCHAR   | UNIQUE NOT NULL |                  Endereço de email do usuário, principal campo de acesso à conta                  |
|  password_hash  |    VARCHAR   |     NOT NULL    |                                   documento CNPJ da empresa                                       |
|    mfa_secret   |    VARCHAR   |         -       |                    Chave de acesso para autenticação multi-factor (2 fatores)                     |
|   mfa_enabled   |    BOOLEAN   |  DEFAULT FALSE  |             Campo para validação se o usuário ativou ou não a autenticão multi-factor             |
|    created_at   |  TIMESTAMPTZ |  DEFAULT NOW()  | Data do registro do usuário no sistema. Uso do TIMESTAMPTZ para precisão na coleta de data e hora |
|    updated_at   |  TIMESTAMPTZ |  DEFAULT NOW()  |           Data de atualização de dados e informações do registro do usuário no sistema            |

<br>

### Tabela ```organization_members```
|      Coluna     | Tipo de Dado |                Constraints               |                                      Descrição                                      |
| :-------------: | :----------: | :--------------------------------------: | :---------------------------------------------------------------------------------: |
|        id       |      UUID    |                     PK                   |        Identificação única do registro de relacionamento membro/organização         |
| organization_id |      UUID    | FK REFERENCES organizations(id) NOT NULL |  Chave estrangeira que referencia o id de uma organização da tabela organizations   |
|     user_id     |      UUID    |     FK REFERENCES users(id) NOT NULL     |         Chave estrangeira que referencia o id de um usuário da tabela users         |
|       role      |    VARCHAR   |         NOT NULL DEFAULT 'MEMBER'        | Campo para gerenciar as permissões de cada usuário do sistema. Valor padrão 'Membro |
|    created_at   |  TIMESTAMPTZ |               DEFAULT NOW()              |           Data do registro do relacionamento membro/organização no sistema          |
|     uq_orgm     |  CONSTRAINT  |     UNIQUE (organization_id, user_id)    | Regra restritiva para evitar duplicidade de registros de relacionamentos no sistema |

## 4. Observações

Foram criadas as 3 tabelas iniciais do sistema com seus principais campos, seguindo a Fase 1 de desenvolvimento do projeto. Todas as sintaxes e operações SQL foram feitas no PostgreSQL.
Task finalizada e aguardando um ambiente Docker (ou outro) para hospedagem do banco.