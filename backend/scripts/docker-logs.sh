#!/bin/bash

# ==========================================
# NEXA WORKSPACE - LOGS
# ==========================================

echo "📋 Logs dos serviços (Ctrl+C para sair)"
echo ""

docker-compose logs -f --tail=100