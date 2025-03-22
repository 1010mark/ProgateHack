import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { NextResponse } from 'next/server';
import { JWT } from 'next-auth/jwt';

// 開発モードではダミーのセッションを返す
const handler =
  // process.env.NODE_ENV !== 'development'
  false
    ? async (req: any) => {
        return NextResponse.json({
          user: {
            id: 'dummy-user-id',
            name: 'サメチーム',
            email: 'test@test.com',
            image: null,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    : NextAuth({
        providers: [
          KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID!,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
            issuer: process.env.KEYCLOAK_ISSUER!,
            authorization: {
              params: {
                scope: 'openid email profile',
              },
            },
          }),
        ],
        callbacks: {
          async jwt({ token, account, profile }): Promise<JWT> {
            if (account && profile) {
              token.accessToken = account.access_token as string;
            }
            return token;
          },
          async session({ session, token }) {
            if (session.user) {
              session.user.id = token.sub as string;
            }
            return session;
          },
          async signIn({ account, profile }) {
            if (account && profile) {
              return true;
            }
            return true;
          },
        },
        pages: {
          signIn: '/auth/login',
        },
      });

export { handler as GET, handler as POST };
