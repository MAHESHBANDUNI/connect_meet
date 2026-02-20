
import NextAuth, { type NextAuthOptions, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      token: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    token: string;
  }
}

function cleanApiErrorMessage(error?: string): string {
  try {
    if (error?.startsWith("API Error:")) {
      const json = error.replace(/^API Error: \d+ - /, "");
      return JSON.parse(json).message || "Authentication failed";
    }
  } catch {}
  return error || "Authentication failed";
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing email or password");
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Invalid credentials");
          }

          const data: {
            user: {
              userId: string;
              email: string;
              firstName: string;
              lastName: string;
              role: {
                roleName: string;
              };
              token: string;
            },
            token: string;
          } = await response.json();

          return {
            id: data.user.userId,
            email: data.user.email,
            name: `${data.user.firstName} ${data.user.lastName}`,
            role: data.user.role.roleName,
            token: data?.token,
          };
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Authentication failed";
          throw new Error(cleanApiErrorMessage(message));
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.token = (user as any).token;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.token = token.token as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXT_ENV !== "production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
