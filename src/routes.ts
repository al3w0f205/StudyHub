/**
 * Centralized route configuration for StudyHub.
 * Shared between proxy.ts (middleware) and auth.config.ts (callbacks).
 */

export const publicRoutes = [
  "/",
  "/terms",
  "/privacy",
  "/support",
];

export const authRoutes = [
  "/auth/login",
  "/auth/error",
];

export const apiAuthPrefix = "/api/auth";

/**
 * Routes that require authentication.
 */
export const protectedRoutes = [
  "/dashboard",
  "/quiz",
  "/payment",
  "/suggest",
  "/badges",
  "/updates",
  "/leaderboard",
  "/admin",
  "/profile",
];

/**
 * Routes that are only accessible by admins.
 */
export const adminRoutes = [
  "/admin",
  "/api/admin",
];
