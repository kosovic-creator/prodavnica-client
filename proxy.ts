import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Uzmi jezik iz URL parametra ili postojećeg cookie-a
  const langFromUrl = request.nextUrl.searchParams.get('lang');
  const langFromCookie = request.cookies.get('lang')?.value;

  // Postavi jezik (prioritet: URL > Cookie > default 'sr')
  const lang = langFromUrl || langFromCookie || 'sr';

  // Postavi ili ažuriraj cookie
  response.cookies.set('lang', lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 godina
    sameSite: 'lax',
    httpOnly: false // Omogući pristup iz JavaScript-a ako treba
  });

  return response;
}

// Definiši gdje se middleware primenjuje
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};