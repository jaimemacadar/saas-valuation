#!/bin/bash
# Script de Testes - Fase 1.5: Autenticação

echo "=================================="
echo "Testes - Fase 1.5: Autenticação"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de testes
TOTAL=0
PASSED=0
FAILED=0

# Função para testar
test_case() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    TOTAL=$((TOTAL + 1))
    echo -n "Teste $TOTAL: $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSOU${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FALHOU (esperado: $expected_status, obtido: $response)${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# Base URL
BASE_URL="http://localhost:3001"

echo "=== Testes de Roteamento ==="
test_case "Home page" "$BASE_URL/" "200"
test_case "Login page" "$BASE_URL/login" "200"
test_case "Signup page" "$BASE_URL/signup" "200"
test_case "Forgot password page" "$BASE_URL/forgot-password" "200"
test_case "Dashboard (sem auth)" "$BASE_URL/dashboard" "307"

echo ""
echo "=== Resumo ==="
echo "Total: $TOTAL"
echo -e "Passou: ${GREEN}$PASSED${NC}"
echo -e "Falhou: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Todos os testes passaram!${NC}"
    exit 0
else
    echo -e "${RED}✗ Alguns testes falharam${NC}"
    exit 1
fi
