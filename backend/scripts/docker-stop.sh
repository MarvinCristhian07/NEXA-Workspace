#!/bin/bash

# ==========================================
# NEXA WORKSPACE - STOP DOCKER
# ==========================================

echo "🛑 Parando infraestrutura NEXA Workspace..."

docker-compose down

echo "✅ Serviços parados com sucesso!"
echo "💾 Dados preservados nos volumes Docker"