# Flujo Completo de Intentos de Examen

## Resumen

Este documento explica cómo implementar el flujo completo de intentos de examen, desde la generación hasta la calificación.

## 1. Generar el Examen (Ya implementado)

```typescript
// POST /api/exams/generate
{
  "questions": ["64f1a2b3c4d5e6f7g8h9i0j1", "64f1a2b3c4d5e6f7g8h9i0j2"],
  "title": "Examen de Gramática Básica",
  "language": "es",
  "level": "B1",
  "description": "Examen sobre tiempos verbales",
  "topic": "grammar",
  "attemptsAllowed": 3,
  "timeLimit": 30
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Exam generated from questions successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "title": "Examen de Gramática Básica",
    "language": "es",
    "level": "B1",
    "attemptsAllowed": 3,
    "timeLimit": 30,
    "questions": [...]
  }
}
```

## 2. Crear un Intento de Examen

Cuando el usuario quiere empezar el examen:

```typescript
// POST /api/exam-attempts
{
  "user": "64f1a2b3c4d5e6f7g8h9i0j4",
  "exam": "64f1a2b3c4d5e6f7g8h9i0j3",
  "attemptNumber": 1
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Exam attempt created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "user": "64f1a2b3c4d5e6f7g8h9i0j4",
    "exam": "64f1a2b3c4d5e6f7g8h9i0j3",
    "attemptNumber": 1,
    "status": "in_progress",
    "startedAt": "2024-01-15T10:30:00.000Z",
    "answers": []
  }
}
```

## 3. Enviar Respuestas Individuales

Durante el examen, por cada pregunta que responde el usuario:

```typescript
// POST /api/exam-attempts/64f1a2b3c4d5e6f7g8h9i0j5/submit-answer
{
  "questionId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "answer": "Yo voy al supermercado todos los días"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "answers": [
      {
        "question": "64f1a2b3c4d5e6f7g8h9i0j1",
        "answer": "Yo voy al supermercado todos los días",
        "submittedAt": "2024-01-15T10:35:00.000Z"
      }
    ]
  }
}
```

## 4. Finalizar el Intento

Cuando el usuario termina el examen:

```typescript
// POST /api/exam-attempts/64f1a2b3c4d5e6f7g8h9i0j5/submit
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Exam attempt submitted successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "status": "submitted",
    "submittedAt": "2024-01-15T11:00:00.000Z",
    "duration": 1800
  }
}
```

## 5. Calificar el Intento (con IA)

Después de que la IA evalúe las respuestas:

```typescript
// POST /api/exam-attempts/64f1a2b3c4d5e6f7g8h9i0j5/grade
{
  "aiEvaluation": {
    "grammar": 85,
    "fluency": 90,
    "coherence": 88,
    "vocabulary": 92,
    "comments": "Excelente trabajo. El estudiante demuestra un buen dominio de la gramática básica y usa vocabulario apropiado para el nivel B1."
  },
  "cefrEstimated": "B2",
  "aiNotes": "El estudiante muestra progreso significativo en comparación con intentos anteriores."
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Exam attempt graded successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "status": "graded",
    "passed": true,
    "cefrEstimated": "B2",
    "aiEvaluation": {
      "grammar": 85,
      "fluency": 90,
      "coherence": 88,
      "vocabulary": 92,
      "comments": "Excelente trabajo..."
    },
    "aiNotes": "El estudiante muestra progreso significativo..."
  }
}
```

## 6. Consultar Intentos

### Obtener todos los intentos de un usuario para un examen específico:

```typescript
// GET /api/exam-attempts/user/64f1a2b3c4d5e6f7g8h9i0j4/exam/64f1a2b3c4d5e6f7g8h9i0j3
```

### Obtener estadísticas del usuario:

```typescript
// GET /api/exam-attempts/user/64f1a2b3c4d5e6f7g8h9i0j4/stats
```

## 7. Listar Exámenes con Información de Intentos

### Obtener exámenes con información de intentos del usuario:

```typescript
// GET /api/exams/user/64f1a2b3c4d5e6f7g8h9i0j4/with-attempts
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Exams with attempt information retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "title": "Examen de Gramática Básica",
        "language": "es",
        "level": "B1",
        "attemptsAllowed": 3,
        "timeLimit": 30,
        "questions": [...],
        "userAttempts": 2,
        "lastAttemptDate": "2024-01-15T10:30:00.000Z",
        "bestScore": 85.5,
        "createdAt": "2024-01-10T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

**Campos adicionales incluidos:**

- `userAttempts`: Número de intentos que ha hecho el usuario
- `lastAttemptDate`: Fecha del último intento
- `bestScore`: Mejor puntaje obtenido (promedio de las evaluaciones de IA)

### Filtros disponibles:

```typescript
// GET /api/exams/user/64f1a2b3c4d5e6f7g8h9i0j4/with-attempts?level=B1&limit=10&sortBy=createdAt&sortOrder=desc
```

**Parámetros de consulta:**

- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `level`: Nivel CEFR (A1, A2, B1, B2, C1, C2)
- `language`: Idioma del examen
- `topic`: Tema del examen
- `source`: Fuente del examen (manual, ai)
- `adaptive`: Si es adaptativo (true/false)
- `sortBy`: Campo para ordenar (default: createdAt)
- `sortOrder`: Orden (asc/desc, default: desc)

## Implementación en el Frontend

### Ejemplo con JavaScript/TypeScript:

```typescript
class ExamAttemptManager {
  private attemptId: string | null = null;

  // OVIAMNETE AQUI TU USAS AXIOS,
  async startExam(userId: string, examId: string): Promise<void> {
    const response = await fetch("/api/exam-attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: userId,
        exam: examId,
        attemptNumber: 1,
      }),
    });

    const data = await response.json();
    this.attemptId = data.data._id;
  }

  async submitAnswer(questionId: string, answer: string): Promise<void> {
    if (!this.attemptId) throw new Error("No active attempt");

    await fetch(`/api/exam-attempts/${this.attemptId}/submit-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer }),
    });
  }

  async finishExam(): Promise<void> {
    if (!this.attemptId) throw new Error("No active attempt");

    await fetch(`/api/exam-attempts/${this.attemptId}/submit`, {
      method: "POST",
    });
  }

  async getAttemptHistory(userId: string, examId: string): Promise<any[]> {
    const response = await fetch(
      `/api/exam-attempts/user/${userId}/exam/${examId}`
    );
    const data = await response.json();
    return data.data;
  }
}

// Uso:
const examManager = new ExamAttemptManager();

// Empezar examen
await examManager.startExam("userId", "examId");

// Enviar respuestas
await examManager.submitAnswer("questionId1", "Mi respuesta");
await examManager.submitAnswer("questionId2", "Otra respuesta");

// Terminar examen
await examManager.finishExam();

// Ver historial
const history = await examManager.getAttemptHistory("userId", "examId");
```

## Validaciones Importantes

1. **Límite de intentos**: Verificar que el usuario no exceda `attemptsAllowed`
2. **Tiempo límite**: Controlar que no se exceda `timeLimit`
3. **Estado del intento**: Solo permitir acciones según el estado actual
4. **Pertenencia**: Verificar que el usuario sea dueño del intento

## Estados del Intento

- `in_progress`: El usuario está tomando el examen
- `submitted`: El examen fue enviado pero no calificado
- `graded`: El examen fue calificado por la IA

## Campos Importantes

- `attemptNumber`: Número secuencial del intento (1, 2, 3...)
- `duration`: Tiempo total en segundos
- `passed`: Boolean que indica si aprobó (basado en puntaje promedio)
- `cefrEstimated`: Nivel CEFR estimado por la IA
- `aiEvaluation`: Evaluación detallada de la IA
