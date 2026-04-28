import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import authConfig from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),

  providers: [
    ...authConfig.providers,

    // Credentials — for admin login only
    Credentials({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.role !== "ADMIN" || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Refresh user data from DB to catch subscription/suspension changes
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            role: true,
            subscriptionExpiry: true,
            isSuspended: true,
            allowedCareers: true,
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.subscriptionExpiry = dbUser.subscriptionExpiry?.toISOString() ?? null;
          token.isSuspended = dbUser.isSuspended;
          token.allowedCareers = dbUser.allowedCareers;
        }
      }

      return token;
    },

    async signIn({ user, account }) {
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isSuspended: true, allowedCareers: true },
        });
        if (dbUser?.isSuspended) return false;

        // For new Google users: set allowedCareers to "" (no access) if still null
        if (account?.provider === "google" && dbUser && dbUser.allowedCareers === null) {
          await prisma.user.update({
            where: { id: user.id },
            data: { allowedCareers: "" },
          });
        }
      }
      return true;
    },
  },
});
