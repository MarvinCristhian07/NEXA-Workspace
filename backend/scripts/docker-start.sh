#!/bin/bash

# ==========================================
# NEXA WORKSPACE - START DOCKER
# ==========================================

echo "🚀 Iniciando infraestrutura NEXA Workspace..."

# Carregar variáveis de ambiente
if [ -f .env.docker ]; then
    export $(cat .env.docker | grep -v '^#' | xargs)
fi

# Subir containers
docker-compose up -d

# Aguardar serviços ficarem saudáveis
echo "⏳ Aguardando serviços iniciarem..."
sleep 5

# Verificar status
echo ""
echo "📊 Status dos serviços:"
docker-compose ps

echo ""
echo "✅ Infraestrutura iniciada com sucesso!"
echo ""
echo "📍 Acessos:"
echo "   PostgreSQL:  localhost:5432"
echo "   pgAdmin:     http://localhost:5050"
echo "   Redis:       localhost:6379"
echo ""
echo "🔐 Credenciais:"
echo "   DB User:     nexa_admin"
echo "   DB Password: nexa_secure_2024"
echo "   pgAdmin:     admin@nexa.local / admin123"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs:    ./scripts/docker-logs.sh"
echo "   Parar tudo:  ./scripts/docker-stop.sh"
echo "   Resetar:     ./scripts/docker-reset.sh"