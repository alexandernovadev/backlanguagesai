import OpenAI from "openai";
import Exam, { IExam } from "../../db/models/Exam";
import { IExamAttempt } from "../../db/models/ExamAttempt";

export interface AIGradingResult {
  score: number;
  feedback: string;
  questionAnalysis: Array<{
    questionId: string;
    userAnswer: string[];
    isCorrect: boolean;
    points: number;
    aiComment: string;
  }>;
}

export class ExamGradingService {
  async gradeExamWithAI(
    attempt: IExamAttempt,
    userLanguage: string = "es"
  ): Promise<AIGradingResult> {
    // Obtener el examen con las preguntas y pesos
    const exam = await Exam.findById(attempt.exam).populate(
      "questions.question"
    );

    if (!exam) {
      throw new Error("Exam not found");
    }

    // Preparar el prompt para AI
    const prompt = this.buildGradingPrompt(attempt, exam, userLanguage);

    try {
      console.log("Calling AI for exam grading...");
      const aiResponse = await this.callAI(prompt);
      console.log("AI response received successfully");

      // Parsear la respuesta de AI
      const parsedResponse = this.parseAIResponse(aiResponse);

      return parsedResponse;
    } catch (error) {
      console.error("Error calling AI for grading:", error);
      throw new Error("Failed to grade exam with AI");
    }
  }

  private buildGradingPrompt(
    attempt: IExamAttempt,
    exam: IExam,
    userLanguage: string
  ): string {
    const questionsWithWeights = attempt.answers
      .map((answer, index) => {
        const examQuestion = exam.questions.find(
          (q: any) => q.question._id.toString() === answer.questionId.toString()
        );
        const weight = examQuestion ? examQuestion.weight : 1;

        return `
Pregunta ${index + 1} (Peso: ${weight} puntos):
Texto: ${answer.questionText}
Opciones disponibles:
${answer.options
  .map(
    (opt, optIndex) =>
      `${optIndex + 1}. ${opt.label} ${opt.isCorrect ? "(CORRECTA)" : ""}`
  )
  .join("\n")}
Respuesta del estudiante: ${answer.userAnswer.join(", ")}
`;
      })
      .join("\n");

    // Determinar el idioma del feedback basado en el idioma del usuario
    const feedbackLanguage = this.getFeedbackLanguage(userLanguage);
    const targetLanguage = exam.language; // Idioma del examen

    return `
You are an experienced and demanding ${targetLanguage} teacher at ${exam.level} level with over 15 years of experience teaching languages. Your approach is direct, honest, and constructive. You are not condescending or overly positive when students make serious mistakes.

Exam Title: ${exam.title}
Maximum Score: ${attempt.maxScore}
Exam Language: ${targetLanguage}
Feedback Language: ${feedbackLanguage}

IMPORTANT: You must provide feedback in ${feedbackLanguage}, but the exam is in ${targetLanguage}.

Please grade the following student responses:

${questionsWithWeights}

DETAILED INSTRUCTIONS:

1. **ANALYSIS OF EACH QUESTION:**
   - Determine if each answer is correct or incorrect
   - Assign points according to question weight (correct = full weight, incorrect = 0)
   - For each question, provide an EXTREMELY DETAILED aiComment in rich HTML format

2. **aiComment FORMAT (RICH HTML):**
   - Minimum 400 words per comment (much more detailed than before)
   - Use HTML tags: <strong>, <em>, <u>, <br>, <ul>, <li>, <span style="color: #color">
   - Include:
     * <strong>Error Analysis</strong>: EXTREMELY DETAILED analysis of why the answer is wrong. Explain the specific linguistic concept the student is missing, the underlying grammar rule they don't understand, and the cognitive gap in their language learning. This should be a comprehensive breakdown of the error, not just a simple explanation.
     * <strong>Detailed Explanation</strong>: COMPREHENSIVE explanation including: specific grammar rules with examples, vocabulary nuances, contextual usage, common misconceptions, and why this particular error occurs. Include multiple examples and variations to ensure complete understanding.
     * <strong>Correct Examples</strong>: Multiple examples of correct usage
     * <strong>Specific Tips</strong>: How to avoid this error in the future

3. **GENERAL FEEDBACK (RICH HTML):**
   - Minimum 600 words (much more comprehensive than before)
   - Be REALISTIC and DIRECT:
     * If student lost many points: Be critical but constructive
     * If student barely passed: Acknowledge effort but point out weaknesses
     * If student got good score: Congratulate but identify areas for improvement
   - Include:
     * <strong>Overall Performance Assessment</strong>
     * <strong>Identified Strengths</strong> (if any)
     * <strong>Critical Weaknesses</strong> that need to be corrected
     * <strong>Specific Improvement Plan</strong> with concrete steps
     * <strong>Expectations for Next Exam</strong>

4. **FEEDBACK TONE:**
   - If score < 60%: Be direct about deficiencies
   - If score 60-80%: Acknowledge progress but point out important errors
   - If score > 80%: Congratulate but maintain high standards

5. **CALCULATE TOTAL SCORE** by adding all points earned

Respond in the following JSON format:
{
  "score": number,
  "feedback": "<div>elaborate general feedback in rich HTML in ${feedbackLanguage}</div>",
  "questionAnalysis": [
    {
      "questionId": "question id",
      "userAnswer": ["user answer"],
      "isCorrect": true/false,
      "points": points earned,
      "aiComment": "<div>elaborate specific comment in rich HTML for this question in ${feedbackLanguage}</div>"
    }
  ]
}

REMEMBER: Comments must be substantial, educational, and realistic. Don't be superficial or overly positive when there are serious errors. 

CRITICAL REQUIREMENTS FOR DETAILED ANALYSIS:
- Each aiComment must be a mini-lesson, not just a simple explanation
- Include step-by-step breakdowns of grammar concepts
- Provide multiple examples with different contexts
- Explain the "why" behind each rule, not just the "what"
- Address common misconceptions and why students make these specific errors
- Include practical tips for remembering the correct usage
- Make connections to other related grammar concepts when relevant
`;
  }

  private getFeedbackLanguage(userLanguage: string): string {
    const languageMap: { [key: string]: string } = {
      es: "español",
      en: "inglés",
      fr: "francés",
      de: "alemán",
      it: "italiano",
      pt: "portugués",
    };

    return languageMap[userLanguage] || "español";
  }

  private async callAI(prompt: string): Promise<string> {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content:
              "You are an experienced, demanding language teacher with 15+ years of experience. You provide detailed, honest, and constructive feedback. You are not overly positive when students make serious mistakes. Your feedback is comprehensive, educational, and realistic. You use rich HTML formatting to make feedback clear and structured. You always provide substantial analysis with specific examples and actionable advice. You are direct and critical when necessary, but always constructive. Your comments are thorough and educational, not superficial.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("AI service error:", error);
      return "";
    }
  }

  private parseAIResponse(aiResponse: string): AIGradingResult {
    try {
      // Intentar parsear JSON de la respuesta de AI
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: parsed.score || 0,
          feedback: parsed.feedback || "No feedback available",
          questionAnalysis: parsed.questionAnalysis || [],
        };
      }

      // Si no se puede parsear, usar fallback
      return this.getFallbackResponse();
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): AIGradingResult {
    return {
      score: 0,
      feedback:
        "No se pudo calificar automáticamente. Por favor, revisa manualmente.",
      questionAnalysis: [],
    };
  }
}
