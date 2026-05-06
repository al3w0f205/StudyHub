import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export class BaseService {
  protected db: PrismaClient = prisma;
  protected logger = logger;

  protected handleError(error: unknown, context: string): never {
    this.logger.error({ error, context }, `Error in ${context}`);
    throw new Error(`Service Error: ${context}`);
  }
}
