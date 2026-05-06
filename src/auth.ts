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
    Credentials({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || user.role !== "ADMIN" || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          isSuspended: user.isSuspended,
          allowedCareers: user.allowedCareers,
          subscriptionExpiry: user.subscriptionExpiry?.toISOString() ?? null,
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
        token.subscriptionExpiry = user.subscriptionExpiry;
        token.isSuspended = user.isSuspended;
        token.allowedCareers = user.allowedCareers;
        token.lastRefreshed = Date.now();
      }

      const now = Date.now();
      if (
        token.id &&
        (!token.lastRefreshed || now - (token.lastRefreshed as number) > 300000)
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            subscriptionExpiry: true,
            isSuspended: true,
            allowedCareers: true,
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.subscriptionExpiry =
            dbUser.subscriptionExpiry?.toISOString() ?? null;
          token.isSuspended = dbUser.isSuspended;
          token.allowedCareers = dbUser.allowedCareers;
          token.lastRefreshed = now;
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

        if (
          account?.provider === "google" &&
          dbUser &&
          dbUser.allowedCareers === null
        ) {
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
