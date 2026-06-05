#!/bin/bash

# ==========================================
# NEXA WORKSPACE - RESET DOCKER
# ⚠️  CUIDADO: Remove TODOS os dados!
# ==========================================

echo "⚠️  ATENÇÃO: Isso vai DELETAR todos os dados!"
echo "Deseja continuar? (digite 'SIM' para confirmar)"
read -r confirmation

if [ "$confirmation" != "SIM" ]; then
    echo "❌ Operação cancelada"
    exit 0
fi

echo "🗑️  Removendo containers, volumes e networks..."

docker-compose down -v --remove-orphans

echo "✅ Reset completo! Execute ./scripts/docker-start.sh para recriar"