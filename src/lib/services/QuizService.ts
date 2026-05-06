import { BaseService } from "./BaseService";
import { Question, Category } from "@/types";
import { encodeForensic } from "@/lib/forensic";

export class QuizService extends BaseService {
  /**
   * Fetches questions that the user failed in their most recent attempt.
   */
  async getFailedQuestions(userId: string): Promise<Question[]> {
    try {
      const responses = await this.db.questionResponse.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      const latestStatus: Record<string, boolean> = {};
      responses.forEach((r) => {
        if (!(r.questionId in latestStatus)) {
          latestStatus[r.questionId] = r.isCorrect;
        }
      });

      const failedIds = Object.keys(latestStatus).filter((id) => !latestStatus[id]);
      if (failedIds.length === 0) return [];

      const questions = await this.db.question.findMany({
        where: { id: { in: failedIds } },
        include: {
          category: {
            select: { name: true, career: { select: { name: true } } },
          },
        },
      });

      return questions.sort(() => 0.5 - Math.random()) as unknown as Question[];
    } catch (error) {
      this.handleError(error, "QuizService.getFailedQuestions");
    }
  }

  /**
   * Fetches all categories for a specific career slug.
   */
  async getCategoriesByCareer(careerSlug: string) {
    try {
      return await this.db.category.findMany({
        where: { career: { slug: careerSlug } },
        include: {
          _count: { select: { questions: true } },
        },
      });
    } catch (error) {
      this.handleError(error, "QuizService.getCategoriesByCareer");
    }
  }

  /**
   * Fetches a full category with questions and filters them based on user progress.
   */
  async getQuizData(categoryId: string, userId: string, isAdmin: boolean) {
    try {
      const category = await this.db.category.findUnique({
        where: { id: categoryId },
        include: {
          career: { select: { id: true, name: true, slug: true } },
          questions: {
            select: {
              id: true,
              text: true,
              options: true,
              correctIndex: true,
              hint: true,
              explanation: true,
            },
          },
        },
      });

      if (!category) return null;

      // Filter completed questions (where the latest response is correct)
      const userResponses = await this.db.questionResponse.findMany({
        where: {
          userId,
          questionId: { in: category.questions.map((q) => q.id) },
        },
        orderBy: { createdAt: "desc" },
      });

      const latestStatus: Record<string, boolean> = {};
      userResponses.forEach((r) => {
        if (!(r.questionId in latestStatus)) {
          latestStatus[r.questionId] = r.isCorrect;
        }
      });

      const completedQuestionIds = Object.keys(latestStatus).filter(
        (id) => latestStatus[id]
      );
      const pendingQuestions = category.questions.filter(
        (q) => !completedQuestionIds.includes(q.id)
      );

      // Shuffle and Watermark
      const quizSeed = this.hashSeed(userId);
      const shuffled = this.seededShuffle(pendingQuestions, quizSeed).map(
        (question) => {
          const options = (question.options as string[]).map((text, index) => ({
            text,
            isCorrect: index === question.correctIndex,
          }));
          const shuffledOptions = this.seededShuffle(
            options,
            `${quizSeed}:${question.id}`
          );

          return {
            ...question,
            text: encodeForensic(question.text, userId),
            explanation: question.explanation
              ? encodeForensic(question.explanation, userId)
              : null,
            options: shuffledOptions.map((option) => option.text),
            correctIndex: shuffledOptions.findIndex((option) => option.isCorrect),
          };
        }
      );

      return {
        category,
        questions: shuffled,
        totalQuestionsInCategory: category.questions.length,
        initialCompletedCount: completedQuestionIds.length,
      };
    } catch (error) {
      this.handleError(error, "QuizService.getQuizData");
    }
  }

  private hashSeed(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  private seededShuffle<T>(items: T[], seedValue: string | number): T[] {
    const seed = typeof seedValue === "string" ? this.hashSeed(seedValue) : seedValue;
    let state = seed || 1;
    const random = () => {
      state = Math.imul(1664525, state) + 1013904223;
      return (state >>> 0) / 4294967296;
    };

    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

export const quizService = new QuizService();
