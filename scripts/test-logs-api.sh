#!/bin/bash

# Script para probar la API de logs mejorada
BASE_URL="http://localhost:3000/api"
TOKEN="your_token_here"  # Reemplazar con un token válido

echo "🧪 Testing Enhanced Logs API"
echo "================================"

# Función para hacer requests
make_request() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    
    if [ "$method" = "POST" ]; then
        curl -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -s | jq .
    else
        curl -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -s | jq .
    fi
}

echo "1. 📊 Getting logs with pagination..."
make_request "/logs?page=1&limit=10"

echo -e "\n2. 🔍 Filtering logs by level..."
make_request "/logs?level=ERROR&limit=5"

echo -e "\n3. 📅 Filtering logs by date range..."
make_request "/logs?dateFrom=2024-01-01&dateTo=2024-12-31&limit=5"

echo -e "\n4. 🔎 Searching logs..."
make_request "/logs?search=api&limit=5"

echo -e "\n5. 📈 Getting log statistics..."
make_request "/logs/statistics"

echo -e "\n6. 📤 Exporting logs as JSON..."
make_request "/logs/export?format=json" > /dev/null && echo "JSON export completed"

echo -e "\n7. 📤 Exporting logs as CSV..."
make_request "/logs/export?format=csv" > /dev/null && echo "CSV export completed"

echo -e "\n8. 🧹 Testing clear logs (commented out for safety)..."
# make_request "/logs/clear"

echo -e "\n✅ All tests completed!" 