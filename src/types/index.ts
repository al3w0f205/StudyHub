import { Role, PaymentRequestStatus } from "@prisma/client";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
  subscriptionExpiry?: Date | null;
  isSuspended: boolean;
  streak: number;
  totalPoints: number;
  allowedCareers?: string | null;
  allowedUniversities?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  hint?: string | null;
  explanation?: string | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  theory?: string | null;
  careerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface University {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Career {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  universityId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizProgress {
  id: string;
  userId: string;
  categoryId: string;
  score: number;
  attempts: number;
  updatedAt: Date;
}

export interface ErrorReport {
  id: string;
  questionId: string;
  userId: string;
  reason: string;
  status: string;
  createdAt: Date;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  receiptUrl: string;
  status: PaymentRequestStatus;
  userComment?: string | null;
  requestedCareers?: string | null;
  createdAt: Date;
}
