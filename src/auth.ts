import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { limitar } from '@/lib/rate-limit';
import type { Role } from '@/lib/rbac';

const credencialesSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
});

// Compared against when the user does not exist, so response time does not reveal valid emails.
const DUMMY_HASH = '$2b$12$iLvj48JnWDSgvFFNO5lcCuOwsd9L7JtTsejHtj69AJXoiUxRlgQ1.';
const OCHO_HORAS = 8 * 60 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: OCHO_HORAS },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      async authorize(raw) {
        const parsed = credencialesSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        if (!limitar(`login:${email}`)) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        return ok && user ?{ id: user.id, email: user.email, role: user.role } : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
});