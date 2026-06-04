import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user) return null;
          const valid = await bcrypt.compare(credentials.password, user?.passwordHash ?? "");
          if (!valid) return null;
          return { id: user?.id, email: user?.email, name: user?.name, role: user?.role };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user?.id;
        token.role = user?.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session as any).user.id = token?.id;
        (session as any).user.role = token?.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
