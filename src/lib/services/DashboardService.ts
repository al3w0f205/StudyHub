import { BaseService } from "./BaseService";

export class DashboardService extends BaseService {
  async getDashboardStats(userId: string, allowedCareers: string[], isAdmin: boolean) {
    try {
      const careerWhere = isAdmin
        ? {}
        : allowedCareers.length > 0
        ? { slug: { in: allowedCareers } }
        : { id: "__no_access__" };

      const categoryWhere = isAdmin
        ? {}
        : allowedCareers.length > 0
        ? { career: { slug: { in: allowedCareers } } }
        : { id: "__no_access__" };

      const [careerCount, questionCount, categories, quizProgress] = await Promise.all([
        this.db.career.count({ where: careerWhere }),
        this.db.question.count({ where: { category: categoryWhere } }),
        this.db.category.findMany({
          where: categoryWhere,
          select: { id: true, name: true, career: { select: { name: true } } },
        }),
        this.db.quizProgress.findMany({
          where: { userId },
          select: { categoryId: true, score: true },
        }),
      ]);

      const progressMap: Record<string, number> = {};
      quizProgress.forEach((p) => {
        progressMap[p.categoryId] = p.score;
      });

      return {
        careerCount,
        questionCount,
        categories,
        progressMap,
      };
    } catch (error) {
      this.handleError(error, "DashboardService.getDashboardStats");
    }
  }
}

export const dashboardService = new DashboardService();
