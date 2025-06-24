# Language Learning AI Backend 🚀

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21.1-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.12.1-green.svg)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4--o-orange.svg)](https://openai.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A powerful AI-driven backend API for language learning applications. Generate educational content, vocabulary definitions, audio, and images using OpenAI's advanced language models.

## 🌟 Features

- **🤖 AI-Powered Content Generation**: Create educational texts, word definitions, and examples using GPT-4
- **🎨 Image Generation**: Generate contextual images for words and lessons using DALL-E 3
- **🔊 Text-to-Speech**: Convert educational content to audio using OpenAI TTS
- **📚 Multi-language Support**: English, Spanish, and Portuguese
- **📊 CEFR Level Adaptation**: Content tailored for A1-C2 proficiency levels
- **🔄 Code-switching Examples**: Natural language mixing for bilingual learners
- **📈 Progress Tracking**: Word difficulty levels and usage statistics
- **🔐 JWT Authentication**: Secure user management system
- **📖 Swagger Documentation**: Complete API documentation
- **🐳 Docker Ready**: Containerized deployment

## 🏗️ Architecture

```
src/
├── app/
│   ├── controllers/     # Request handlers
│   ├── db/
│   │   └── models/      # MongoDB schemas
│   ├── middlewares/     # Authentication & validation
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   │   ├── ai/          # OpenAI integrations
│   │   ├── auth/        # Authentication services
│   │   ├── cloudinary/  # Image storage
│   │   ├── lectures/    # Educational content
│   │   └── words/       # Vocabulary management
│   └── utils/           # Helper functions
├── main.ts              # Application entry point
└── swagger/             # API documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- MongoDB 6.x or higher
- OpenAI API key
- Cloudinary account (for image storage)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
VERSION=1.0.0

# Database
MONGO_URL=mongodb://localhost:27017/language_ai

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Authentication
JWT_SECRET=your_jwt_secret_key
USER_NOVA=admin
PASSWORD_NOVA=adminpassword
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd language-ai-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api-docs

## 📚 API Documentation

### Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "adminpassword"}'
```

### AI Content Generation

```bash
# Generate educational text
curl -X POST http://localhost:3000/api/ai/generate-text \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "The importance of renewable energy",
    "level": "B2",
    "typeWrite": "Academic Article"
  }'

# Generate word definition
curl -X POST http://localhost:3000/api/ai/generate-wordJson \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "sustainability",
    "language": "en"
  }'

# Generate audio from text
curl -X POST http://localhost:3000/api/ai/generate-audio-from-text \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Learning a new language can be fun and rewarding.",
    "voice": "nova"
  }'
```

### Word Management

```bash
# Get words with pagination
curl -X GET "http://localhost:3000/api/words?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a new word
curl -X POST http://localhost:3000/api/words \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "example",
    "definition": "A representative form or pattern",
    "language": "en",
    "level": "medium"
  }'
```

### Lecture Management

```bash
# Get lectures with pagination
curl -X GET "http://localhost:3000/api/lectures?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a new lecture
curl -X POST http://localhost:3000/api/lectures \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Example Lecture\n\nThis is an example lecture content.",
    "level": "B1",
    "typeWrite": "Article",
    "language": "en",
    "time": 300
  }'
```

## 🗄️ Database Models

### User Model
```typescript
interface IUser {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Word Model
```typescript
interface IWord {
  word: string;
  definition: string;
  examples?: string[];
  type?: string[];
  IPA?: string;
  seen?: number;
  img?: string;
  level?: "easy" | "medium" | "hard";
  synonyms?: string[];
  codeSwitching?: string[];
  language: string;
  spanish?: {
    definition: string;
    word: string;
  };
}
```

### Lecture Model
```typescript
interface ILecture {
  time: number;
  level: string;
  typeWrite: string;
  language: string;
  img?: string;
  urlAudio?: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## 🤖 AI Services

### Text Generation
- **Model**: GPT-4o-2024-08-06
- **Features**: 
  - CEFR level adaptation (A1-C2)
  - Markdown formatting
  - Customizable content types
  - Streaming responses

### Image Generation
- **Model**: DALL-E 3
- **Features**:
  - Contextual word images
  - Lecture illustrations
  - Cloudinary integration

### Audio Generation
- **Service**: OpenAI Text-to-Speech
- **Voices**: nova, alloy, echo, fable, onyx, shimmer
- **Format**: WAV with SRT subtitles

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server

# Docker
docker-compose up   # Start all services
docker-compose down # Stop all services

# Database
npm run seed        # Seed initial data
npm run backup      # Backup database collections
```

### Project Structure

```
├── src/
│   ├── app/
│   │   ├── controllers/          # Request handlers
│   │   ├── db/
│   │   │   ├── models/           # MongoDB schemas
│   │   │   └── mongoConnection.ts
│   │   ├── middlewares/          # Express middlewares
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Business logic
│   │   │   ├── ai/               # OpenAI integrations
│   │   │   ├── auth/             # Authentication
│   │   │   ├── cloudinary/       # Image storage
│   │   │   ├── lectures/         # Educational content
│   │   │   └── words/            # Vocabulary management
│   │   └── utils/                # Helper functions
│   └── main.ts                   # Application entry point
├── swagger/                      # API documentation
├── public/                       # Static files (images, audio)
├── logs/                         # Application logs
└── docs/                         # Project documentation
```

## 🔧 Configuration

### CORS Settings
```typescript
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://languages-ai.alexandernova.pro",
  ],
  credentials: true,
}));
```

### Logging
- **Framework**: Winston
- **Levels**: info, error, debug
- **Outputs**: Console and file-based logging
- **Files**: app.log, errors.log, exceptions.log

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Docker Production

```bash
# Build production image
docker build -t language-ai-backend .

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGO_URL=your_mongo_url \
  -e OPENAI_API_KEY=your_openai_key \
  language-ai-backend
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/
# Response: {"success": true, "message": "Server is running", "data": {...}}
```

### Logs
- Application logs: `logs/app.log`
- Error logs: `logs/errors.log`
- Exception logs: `logs/exceptions.log`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- OpenAI for providing powerful AI models
- MongoDB for the database solution
- Express.js for the web framework
- Cloudinary for image storage
- The open-source community for various tools and libraries

---

**Made with ❤️ for language learners worldwide**
