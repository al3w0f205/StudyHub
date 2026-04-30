// =============================================================================
// StudyHub — Configuración Principal de Autenticación (NextAuth v5)
// =============================================================================
// Este archivo configura la instancia principal de NextAuth usando Prisma como
// adaptador de base de datos. Define dos proveedores: Google OAuth (para
// estudiantes) y Credentials (solo para login de administradores con contraseña).
//
// ARQUITECTURA:
//   - auth.config.js → Configuración edge-compatible (usada por proxy.js)
//   - auth.js (este archivo) → Configuración completa con Prisma + bcrypt (solo server)
//
// SEGURIDAD:
//   - Las contraseñas solo se usan para ADMIN; los estudiantes usan Google OAuth.
//   - El JWT se refresca cada 5 minutos para capturar cambios de suscripción/suspensión.
//   - Los usuarios suspendidos son bloqueados en el callback signIn().
// =============================================================================

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

    // Proveedor Credentials — exclusivo para login de administradores.
    // Los estudiantes NO tienen contraseña; usan Google OAuth.
    Credentials({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // Validación básica de campos requeridos
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Buscar usuario por email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Solo permitir login si es ADMIN y tiene contraseña hasheada
        if (!user || user.role !== "ADMIN" || !user.password) {
          return null;
        }

        // Verificar contraseña con bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Retornar datos mínimos para el token JWT
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

  // Usar JWT para sesiones (requerido para Credentials provider)
  session: {
    strategy: "jwt",
  },

  callbacks: {
    ...authConfig.callbacks,

    // -----------------------------------------------------------------------
    // JWT Callback — Se ejecuta cada vez que se crea o refresca el token.
    //
    // THROTTLING DE 5 MINUTOS:
    // Para evitar una consulta a DB en cada request, solo refrescamos los
    // datos del usuario (rol, suscripción, suspensión, carreras permitidas)
    // si han pasado más de 5 minutos desde la última consulta.
    //
    // IMPLICACIÓN: Si un admin suspende a un usuario o le cambia la suscripción,
    // el cambio se reflejará en un máximo de 5 minutos.
    // -----------------------------------------------------------------------
    async jwt({ token, user }) {
      // Primera vez después de login: guardar datos iniciales
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscriptionExpiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toISOString() : null;
        token.isSuspended = user.isSuspended;
        token.allowedCareers = user.allowedCareers;
        token.lastRefreshed = Date.now();
      }

      // Refrescar datos desde la DB si han pasado más de 5 minutos (300,000ms)
      const now = Date.now();
      if (token.id && (!token.lastRefreshed || now - token.lastRefreshed > 300000)) {
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
          token.lastRefreshed = now;
        }
      }

      return token;
    },

    // -----------------------------------------------------------------------
    // SignIn Callback — Se ejecuta cuando un usuario intenta iniciar sesión.
    //
    // SEGURIDAD:
    // 1. Bloquea usuarios suspendidos (retorna false = error de login).
    // 2. Para nuevos usuarios de Google: inicializa allowedCareers como ""
    //    (sin acceso a ninguna carrera hasta que el admin les asigne).
    // -----------------------------------------------------------------------
    async signIn({ user, account }) {
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isSuspended: true, allowedCareers: true },
        });

        // Bloquear login de usuarios suspendidos
        if (dbUser?.isSuspended) return false;

        // Usuarios nuevos de Google: sin acceso a carreras por defecto
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
