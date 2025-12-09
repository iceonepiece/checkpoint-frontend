import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticate } from './lib/auth';
 
export async function middleware(request: NextRequest) {
  //const sessionToken = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

    const auth = await authenticate();

  // 1. If user is on Login page but HAS a session, send them to Dashboard
  if (pathname === "/login" && auth.ok) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. If user is on a Protected page but NO session
  if (!auth.ok) {
    console.log("NO sessionToken");

    // ALLOW: Login page
    if (pathname === "/login") {
      return NextResponse.next();
    }
    
    // ALLOW: Auth API routes (This is the fix!)
    // This allows /api/auth/github and /api/auth/github/callback to run
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // BLOCK: Redirect everything else to Login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
 
export const config = { 
  matcher: [    
   '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ], 
}