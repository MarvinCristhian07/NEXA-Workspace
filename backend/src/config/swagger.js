/**
 * Configuração do Swagger UI
 * Diponibiliza documentação interativa em /api/docs
 */

import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import yaml from 'yaml';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega o YAML do contrato
const openApiDocument = yaml.parse(
  readFileSync(join(__dirname, '../../../docs/api/openapi.yaml'), 'utf8')
);

export const swaggerSpec = openApiDocument;

export const swaggerUiOptions = {
    customSiteTitle: 'NEXA Workspace - API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #0f172a; }
      .swagger-ui .topbar-wrapper img { content: url(''); }
      .swagger-ui .topbar-wrapper::after {
        content: 'NEXA Workspace API';
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
      }
    `,
    swaggerOptions: {
        persistAuthorization: true,     // Mantém o token após reload
        displayRequestDuration: true,   // Exibe tempo de resposta
        filter: true,                   // Barra de busca
        tryItOutEnabled: true           // Botão "Try it out" já aberto
    }
};

export { swaggerUi };