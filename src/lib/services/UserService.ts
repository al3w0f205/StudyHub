import { BaseService } from "./BaseService";
import { User } from "@/types";

export class UserService extends BaseService {
  /**
   * Fetches user profile with analytics.
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      return (await this.db.user.findUnique({
        where: { id: userId },
      })) as User | null;
    } catch (error) {
      this.handleError(error, "UserService.getUserProfile");
    }
  }

  /**
   * Updates user streak if active today.
   */
  async updateStreak(userId: string) {
    try {
      const user = await this.db.user.findUnique({ where: { id: userId } });
      if (!user) return;

      const now = new Date();
      const lastActive = user.lastActive ? new Date(user.lastActive) : null;
      
      const isToday = lastActive && lastActive.toDateString() === now.toDateString();
      if (isToday) return;

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = lastActive && lastActive.toDateString() === yesterday.toDateString();

      await this.db.user.update({
        where: { id: userId },
        data: {
          streak: isYesterday ? { increment: 1 } : 1,
          lastActive: now,
        },
      });
    } catch (error) {
      this.handleError(error, "UserService.updateStreak");
    }
  }
}

export const userService = new UserService();
