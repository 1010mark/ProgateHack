import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

// 脆弱性ヘッダーを検知してブロックする一時的対策
function checkVulnerabilityHeaders(request: NextRequest) {
  if (request.headers.has('x-middleware-subrequest')) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}

const middleware = (request: NextRequest) => {
  // 脆弱性ヘッダーチェックを実行
  const vulnerabilityCheck = checkVulnerabilityHeaders(request);
  if (vulnerabilityCheck) {
    return vulnerabilityCheck;
  }

  // 開発環境では認証をスキップ
  // if (process.env.NODE_ENV === 'development') {
  //   return NextResponse.next();
  // }

  // 認証ミドルウェアを適用
  return (withAuth({
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
  }) as any)(request, NextResponse);
};

export default middleware;

export const config = {
  matcher: ['/user/:path*', '/api/ingredients/:path*', '/api/recipes/:path*'],
};
