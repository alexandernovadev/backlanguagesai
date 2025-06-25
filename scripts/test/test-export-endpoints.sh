#!/bin/bash

# Script para probar los endpoints de exportación JSON
# Requiere que el servidor esté corriendo en localhost:3000

echo "🧪 Probando endpoints de exportación JSON..."
echo "=============================================="

# URL base del servidor
BASE_URL="http://localhost:3000"

# Crear directorio para los archivos exportados
EXPORT_DIR="exports"
mkdir -p $EXPORT_DIR

# Primero necesitamos obtener un token de autenticación
echo "🔐 Obteniendo token de autenticación..."

TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "novask88", "password": "sashateamomucho"}')

# Extraer el token de la respuesta
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener el token de autenticación"
    echo "Respuesta del servidor: $TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Token obtenido exitosamente"
echo ""

# Generar timestamp para los archivos
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Probar exportación de palabras y guardar en archivo
echo "📝 Exportando palabras a JSON..."
WORDS_FILE="$EXPORT_DIR/words_export_$TIMESTAMP.json"

curl -s -X GET "$BASE_URL/api/words/export-json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -o "$WORDS_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Palabras exportadas exitosamente a: $WORDS_FILE"
    
    # Mostrar estadísticas del archivo
    WORD_COUNT=$(cat "$WORDS_FILE" | jq '.data.totalWords' 2>/dev/null || echo "N/A")
    echo "   📊 Total de palabras: $WORD_COUNT"
    echo "   📁 Tamaño del archivo: $(du -h "$WORDS_FILE" | cut -f1)"
else
    echo "❌ Error al exportar palabras"
fi

echo ""

# Probar exportación de lecciones y guardar en archivo
echo "📚 Exportando lecciones a JSON..."
LECTURES_FILE="$EXPORT_DIR/lectures_export_$TIMESTAMP.json"

curl -s -X GET "$BASE_URL/api/lectures/export-json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -o "$LECTURES_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Lecciones exportadas exitosamente a: $LECTURES_FILE"
    
    # Mostrar estadísticas del archivo
    LECTURE_COUNT=$(cat "$LECTURES_FILE" | jq '.data.totalLectures' 2>/dev/null || echo "N/A")
    echo "   📊 Total de lecciones: $LECTURE_COUNT"
    echo "   📁 Tamaño del archivo: $(du -h "$LECTURES_FILE" | cut -f1)"
else
    echo "❌ Error al exportar lecciones"
fi

echo ""
echo "✅ Exportación completada!"
echo ""
echo "📋 Archivos generados:"
echo "   📝 $WORDS_FILE"
echo "   📚 $LECTURES_FILE"
echo ""
echo "📋 Resumen de endpoints:"
echo "   GET /api/words/export-json     - Exporta todas las palabras a JSON"
echo "   GET /api/lectures/export-json  - Exporta todas las lecciones a JSON"
echo ""
echo "🔗 Documentación Swagger disponible en: $BASE_URL/api-docs"
echo ""
echo "💡 Para ver el contenido de los archivos:"
echo "   cat $WORDS_FILE | jq '.'"
echo "   cat $LECTURES_FILE | jq '.'" 