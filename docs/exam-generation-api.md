# 📚 Exam Generation API Documentation

## 🎯 Overview

The Exam Generation API allows you to create AI-powered English language learning exams with questions tailored to specific CEFR levels, topics, and difficulty settings.

**Endpoint**: `POST /api/ai/generate-exam`

---

## 🚀 Quick Start

### Basic Request
```javascript
const response = await fetch('/api/ai/generate-exam', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    topic: "daily life",
    level: "B1",
    numberOfQuestions: 10
  })
});

const examData = await response.json();
```

### Basic Response
```json
{
  "questions": [
    {
      "text": "What is the correct form of the verb 'to be' for 'I'?",
      "type": "multiple_choice",
      "options": [
        { "value": "A", "label": "am", "isCorrect": true },
        { "value": "B", "label": "is", "isCorrect": false },
        { "value": "C", "label": "are", "isCorrect": false }
      ],
      "correctAnswers": ["A"],
      "explanation": "The correct form of 'to be' for first person singular is 'am'.",
      "tags": ["grammar", "present_tense"]
    }
  ]
}
```

---

## 📋 Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `topic` | `string` | ✅ Yes | - | Main topic or subject for the exam (1-200 chars) |
| `grammarTopics` | `string[]` | ❌ No | `[]` | List of mandatory grammar topics to include (max 10) |
| `level` | `string` | ❌ No | `"B1"` | CEFR level: `"A1"`, `"A2"`, `"B1"`, `"B2"`, `"C1"`, `"C2"` |
| `numberOfQuestions` | `number` | ❌ No | `10` | Number of questions (1-50) |
| `types` | `string[]` | ❌ No | `["multiple_choice", "fill_blank", "true_false"]` | Question types to include |
| `difficulty` | `number` | ❌ No | `3` | Difficulty level (1-5) |
| `userLang` | `string` | ❌ No | `"es"` | Language for explanations (ISO 639-1) |

### Question Types Available
- `"multiple_choice"` - Multiple choice questions
- `"fill_blank"` - Fill in the blank questions
- `"true_false"` - True/False questions
- `"translate"` - Translation questions
- `"writing"` - Writing prompts

---

## 🎨 Response Format

### Question Object Structure
```typescript
interface Question {
  text: string;                    // Question text
  type: QuestionType;              // Question type
  options?: Option[];              // Available options (for multiple choice)
  correctAnswers: string[];        // Correct answer values
  explanation: string;             // HTML-formatted explanation
  tags: string[];                  // Question tags
}

interface Option {
  value: string;                   // Option identifier (A, B, C, etc.)
  label: string;                   // Option text
  isCorrect: boolean;              // Whether this option is correct
}
```

### Explanation Formatting
Explanations include colorful HTML styling (dark theme compatible):

- **🔴 Keywords**: `<span style='color: #ff6b6b; font-weight: bold;'>word</span>`
- **🟦 Grammar Rules**: `<span style='color: #74b9ff; border: 1px solid #74b9ff; padding: 2px 4px; border-radius: 3px;'>rule</span>`
- **🟢 Important Concepts**: `<span style='color: #00b894; text-decoration: underline;'>concept</span>`
- **🟡 Examples**: `<span style='color: #fdcb6e; font-style: italic;'>example</span>`

---

## 📝 Usage Examples

### Example 1: Basic Grammar Exam
```javascript
const grammarExam = {
  topic: "grammar basics",
  grammarTopics: ["Present Simple", "Articles", "Prepositions"],
  level: "A2",
  numberOfQuestions: 5,
  types: ["multiple_choice", "fill_blank"],
  difficulty: 2,
  userLang: "es"
};
```

### Example 2: Advanced Vocabulary Exam with Grammar Focus
```javascript
const vocabExam = {
  topic: "business vocabulary",
  grammarTopics: ["Modal Verbs", "Passive Voice", "Conditionals"],
  level: "B2",
  numberOfQuestions: 15,
  types: ["multiple_choice", "true_false"],
  difficulty: 4,
  userLang: "en"
};
```

### Example 3: Mixed Skills Exam with Specific Grammar
```javascript
const mixedExam = {
  topic: "travel and tourism",
  grammarTopics: ["Future Tenses", "Comparative Adjectives", "Phrasal Verbs"],
  level: "B1",
  numberOfQuestions: 20,
  types: ["multiple_choice", "fill_blank", "true_false", "translate"],
  difficulty: 3,
  userLang: "es"
};
```

---

## 🎯 CEFR Level Guidelines

### A1 (Beginner)
- **Vocabulary**: Basic words (house, school, food)
- **Grammar**: Present simple, basic prepositions
- **Question Length**: 8-10 words max
- **Complexity**: One clear meaning, literal options

### A2 (Elementary)
- **Vocabulary**: Slightly richer (travel, jobs, places)
- **Grammar**: Past simple, comparatives, frequency adverbs
- **Question Length**: 10-15 words
- **Complexity**: Simple connectors, context-based options

### B1 (Intermediate)
- **Vocabulary**: Opinions, preferences, routines
- **Grammar**: Present perfect, modals, first conditional
- **Question Length**: 15-25 words
- **Complexity**: Realistic situations, distractors

### B2 (Upper Intermediate)
- **Vocabulary**: Abstract ideas (environment, media, ethics)
- **Grammar**: Passive voice, relative clauses, second conditional
- **Question Length**: 25-40 words
- **Complexity**: Context, dialogue, inference required

### C1 (Advanced)
- **Vocabulary**: Academic, professional, sociocultural
- **Grammar**: Inversion, mixed conditionals, indirect speech
- **Question Length**: 35-60 words
- **Complexity**: Scenarios, quotes, critical reading

### C2 (Proficient)
- **Vocabulary**: Advanced formal vocabulary and idioms
- **Grammar**: Full range, including ellipsis and unusual structures
- **Question Length**: Up to 80 words
- **Complexity**: Subtle irony, tone detection, nuanced interpretation

---

## ⚠️ Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "message": "Topic is required."
}
```

### 400 Validation Error
```json
{
  "success": false,
  "message": "Number of questions must be between 1 and 50."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to generate exam stream"
}
```

---

## 🔧 Frontend Integration Tips

### 1. Loading States
```javascript
const [isLoading, setIsLoading] = useState(false);
const [examData, setExamData] = useState(null);

const generateExam = async (params) => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/ai/generate-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await response.json();
    setExamData(data);
  } catch (error) {
    console.error('Error generating exam:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Rendering Explanations
```javascript
const renderExplanation = (explanation) => {
  return <div dangerouslySetInnerHTML={{ __html: explanation }} />;
};
```

### 3. Question Type Handling
```javascript
const renderQuestion = (question) => {
  switch (question.type) {
    case 'multiple_choice':
      return <MultipleChoiceQuestion question={question} />;
    case 'fill_blank':
      return <FillBlankQuestion question={question} />;
    case 'true_false':
      return <TrueFalseQuestion question={question} />;
    default:
      return <div>Unsupported question type</div>;
  }
};
```

### 4. Validation
```javascript
const validateExamParams = (params) => {
  const errors = [];
  
  if (!params.topic || params.topic.length < 1) {
    errors.push('Topic is required');
  }
  
  if (params.numberOfQuestions < 1 || params.numberOfQuestions > 50) {
    errors.push('Number of questions must be between 1 and 50');
  }
  
  if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(params.level)) {
    errors.push('Invalid CEFR level');
  }
  
  return errors;
};
```

---

## 🎨 Styling Guidelines

### Color Scheme for Explanations (Dark Theme Compatible)
```css
/* Keywords */
.keyword {
  color: #ff6b6b;
  font-weight: bold;
}

/* Grammar Rules */
.grammar-rule {
  color: #74b9ff;
  border: 1px solid #74b9ff;
  padding: 2px 4px;
  border-radius: 3px;
}

/* Important Concepts */
.important-concept {
  color: #00b894;
  text-decoration: underline;
}

/* Examples */
.example {
  color: #fdcb6e;
  font-style: italic;
}
```

---

## 📊 Performance Considerations

- **Streaming Response**: The API returns a stream, so you can show progress
- **Timeout**: Set appropriate timeout (30-60 seconds for large exams)
- **Caching**: Consider caching generated exams for repeated use
- **Rate Limiting**: Implement client-side rate limiting to avoid API abuse

---

## 🔗 Related Endpoints

- `GET /api/exams` - Get existing exams
- `POST /api/exams` - Save generated exam
- `GET /api/questions` - Get individual questions
- `POST /api/exam-attempts` - Submit exam attempts

---

## 📞 Support

For questions or issues with the Exam Generation API, please contact the backend team or check the Swagger documentation at `/api-docs`. 