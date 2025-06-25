# Ejemplos de Filtros para el Endpoint GET /api/words

## Filtros Disponibles

### 1. **Filtro por Palabra** (existente)
```bash
GET /api/words?wordUser=hello
```
Busca palabras que contengan "hello" (case-insensitive)

### 2. **Filtro por Nivel de Dificultad**
```bash
# Solo palabras fáciles
GET /api/words?level=easy

# Solo palabras medianas
GET /api/words?level=medium

# Solo palabras difíciles
GET /api/words?level=hard

# Múltiples niveles (fáciles y medianas)
GET /api/words?level=easy,medium

# Todos los niveles
GET /api/words?level=easy,medium,hard
```

### 3. **Filtro por Idioma**
```bash
# Solo inglés
GET /api/words?language=english

# Solo español
GET /api/words?language=spanish

# Múltiples idiomas
GET /api/words?language=english,spanish

# Tres idiomas
GET /api/words?language=english,spanish,french
```

### 4. **Filtro por Tipo Gramatical**
```bash
# Solo verbos
GET /api/words?type=verb

# Solo sustantivos
GET /api/words?type=noun

# Solo adjetivos
GET /api/words?type=adjective

# Múltiples tipos (verbos y sustantivos)
GET /api/words?type=verb,noun

# Tres tipos gramaticales
GET /api/words?type=verb,noun,adjective
```

### 5. **Filtro por Rango de Vistas**
```bash
# Palabras vistas al menos 5 veces
GET /api/words?seenMin=5

# Palabras vistas máximo 10 veces
GET /api/words?seenMax=10

# Palabras vistas entre 5 y 10 veces
GET /api/words?seenMin=5&seenMax=10
```

### 6. **Ordenamiento**
```bash
# Ordenar por palabra (A-Z)
GET /api/words?sortBy=word&sortOrder=asc

# Ordenar por nivel
GET /api/words?sortBy=level&sortOrder=asc

# Ordenar por número de vistas (más vistas primero)
GET /api/words?sortBy=seen&sortOrder=desc

# Ordenar por fecha de actualización (más recientes primero)
GET /api/words?sortBy=updatedAt&sortOrder=desc

# Ordenar por definición
GET /api/words?sortBy=definition&sortOrder=asc
```

### 7. **Paginación**
```bash
# Página 2 con 20 elementos por página
GET /api/words?page=2&limit=20
```

### 8. **Filtro por Definición**
```bash
# Buscar palabras cuya definición contenga "to move"
GET /api/words?definition=to move
```

### 9. **Filtro por IPA (Fonética)**
```bash
# Buscar palabras con IPA específico
GET /api/words?IPA=/rʌn/
```

### 10. **Filtros Booleanos de Contenido**
```bash
# Solo palabras que tienen imagen
GET /api/words?hasImage=true

# Solo palabras que NO tienen imagen
GET /api/words?hasImage=false

# Solo palabras que tienen ejemplos
GET /api/words?hasExamples=true

# Solo palabras que tienen sinónimos
GET /api/words?hasSynonyms=true

# Solo palabras que tienen code-switching
GET /api/words?hasCodeSwitching=true
```

### 11. **Filtros de Español**
```bash
# Buscar por palabra en español
GET /api/words?spanishWord=correr

# Buscar por definición en español
GET /api/words?spanishDefinition=moverse rápidamente
```

### 12. **Filtros de Fecha**
```bash
# Palabras creadas después de una fecha
GET /api/words?createdAfter=2024-01-01T00:00:00.000Z

# Palabras creadas antes de una fecha
GET /api/words?createdBefore=2024-12-31T23:59:59.999Z

# Palabras actualizadas después de una fecha
GET /api/words?updatedAfter=2024-06-01T00:00:00.000Z

# Palabras actualizadas antes de una fecha
GET /api/words?updatedBefore=2024-06-30T23:59:59.999Z

# Rango de fechas de creación
GET /api/words?createdAfter=2024-01-01T00:00:00.000Z&createdBefore=2024-06-30T23:59:59.999Z
```

## Ejemplos Combinados

### Palabras fáciles en inglés con imagen, ordenadas alfabéticamente
```bash
GET /api/words?level=easy&language=english&hasImage=true&sortBy=word&sortOrder=asc
```

### Verbos difíciles vistos más de 10 veces con ejemplos
```bash
GET /api/words?level=hard&type=verb&seenMin=10&hasExamples=true
```

### Palabras que contengan "run" con sinónimos, ordenadas por fecha de creación
```bash
GET /api/words?wordUser=run&hasSynonyms=true&sortBy=createdAt&sortOrder=desc
```

### Palabras medianas en español con code-switching, paginadas
```bash
GET /api/words?level=medium&language=spanish&hasCodeSwitching=true&page=1&limit=15
```

### Palabras creadas este mes con definición que contenga "action"
```bash
GET /api/words?createdAfter=2024-01-01T00:00:00.000Z&definition=action
```

### Palabras fáciles con imagen y ejemplos, ordenadas por número de vistas
```bash
GET /api/words?level=easy&hasImage=true&hasExamples=true&sortBy=seen&sortOrder=desc
```

### Palabras con traducción al español que contenga "correr"
```bash
GET /api/words?spanishWord=correr&hasExamples=true
```

### Palabras actualizadas en la última semana con IPA
```bash
GET /api/words?updatedAfter=2024-01-15T00:00:00.000Z&IPA=/r/
```

### Palabras fáciles y medianas en inglés con imagen, ordenadas alfabéticamente
```bash
GET /api/words?level=easy,medium&language=english&hasImage=true&sortBy=word&sortOrder=asc
```

### Verbos y sustantivos difíciles vistos más de 10 veces con ejemplos
```bash
GET /api/words?level=hard&type=verb,noun&seenMin=10&hasExamples=true
```

### Palabras en inglés y español con code-switching, ordenadas por fecha de creación
```bash
GET /api/words?language=english,spanish&hasCodeSwitching=true&sortBy=createdAt&sortOrder=desc
```

### Palabras fáciles y medianas con verbos, sustantivos y adjetivos
```bash
GET /api/words?level=easy,medium&type=verb,noun,adjective&hasImage=true
```

## Campos de Ordenamiento Disponibles

- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización
- `word` - Palabra
- `level` - Nivel de dificultad
- `seen` - Número de vistas
- `language` - Idioma
- `definition` - Definición

## Tipos Gramaticales Disponibles

- `noun` - Sustantivo
- `verb` - Verbo
- `adjective` - Adjetivo
- `adverb` - Adverbio
- `personal pronoun` - Pronombre personal
- `possessive pronoun` - Pronombre posesivo
- `preposition` - Preposición
- `conjunction` - Conjunción
- `determiner` - Determinante
- `article` - Artículo
- `quantifier` - Cuantificador
- `interjection` - Interjección
- `auxiliary verb` - Verbo auxiliar
- `modal verb` - Verbo modal
- `infinitive` - Infinitivo
- `participle` - Participio
- `gerund` - Gerundio
- `other` - Otro
- `phrasal verb` - Verbo frasal

## Formatos de Fecha

Los filtros de fecha aceptan formato ISO 8601:
- `2024-01-15T10:30:00.000Z`
- `2024-01-15` (se interpreta como inicio del día)
- `2024-01-15T23:59:59.999Z` (fin del día) 