import { withAuth } from 'next-auth/middleware';

const middleware =
  // process.env.NODE_ENV === 'development'
  false
    ? () => null
    : withAuth({
        pages: {
          signIn: '/auth/login',
        },
        callbacks: {
          authorized: ({ req, token }) => {
            console.log('Middleware called for path:', req.nextUrl.pathname);
            console.log('Token:', token);
            return !!token;
          },
        },
      });

export default middleware;

export const config = {
  matcher: ['/user/:path*', '/api/ingredients/:path*', '/api/recipes/:path*'],
};
