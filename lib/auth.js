import CredentialsProvider from "next-auth/providers/credentials";
import { encode, decode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { clear, hit, isBlocked } from "@/lib/throttle";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60;
const EIGHT_HOURS = 8 * 60 * 60;

// Used so "unknown email" takes as long as "wrong password".
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

function readIp(req) {
  const headers = req?.headers;
  if (!headers) return "unknown";
  const raw = typeof headers.get === "function" ? headers.get("x-forwarded-for") : headers["x-forwarded-for"];
  return String(raw ?? "unknown").split(",")[0].trim() || "unknown";
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: THIRTY_DAYS },
  pages: { signIn: "/login" },
  jwt: {
    maxAge: THIRTY_DAYS,
    // "Remember me" = 30-day token, otherwise 8 hours.
    async encode({ token, secret, maxAge }) {
      return encode({ token, secret, maxAge: token?.remember ? maxAge : EIGHT_HOURS });
    },
    async decode({ token, secret }) {
      return decode({ token, secret });
    },
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember me", type: "text" },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password, remember } = parsed.data;

        const ip = readIp(req);
        const accountKey = `login:${ip}:${email}`;
        const ipKey = `login-ip:${ip}`;

        if (isBlocked(accountKey, MAX_FAILURES) || isBlocked(ipKey, MAX_FAILURES * 4)) {
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

        if (!user || !valid || !user.isActive) {
          hit(accountKey, { limit: MAX_FAILURES, windowMs: WINDOW_MS });
          hit(ipKey, { limit: MAX_FAILURES * 4, windowMs: WINDOW_MS });
          return null;
        }

        clear(accountKey);
        return { id: user.id, name: user.name, email: user.email, role: user.role, remember };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.remember = user.remember;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};