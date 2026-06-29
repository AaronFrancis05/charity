import { NextRequest, NextResponse } from "next/server";

const ADMIN_PATHS = /^\/admin(?!\/login)/;
const PUBLIC_PATHS = [
  /^\/$/,
  /^\/sponsor/,
  /^\/api\/webhooks\//,
  /^\/api\/donations\//,
  /^\/api\/turnstile/,
  /^\/api\/children/,
  /^\/_next/,
  /^\/favicon/,
  /^\/images/,
];

// Changed to a DEFAULT export to satisfy Turbopack's bundle parser
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => p.test(pathname))) {
    return NextResponse.next();
  }

  // Login page — set header if already authenticated so we can show a notice
  if (pathname === "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (sessionCookie) {
      try {
        const dot = sessionCookie.indexOf(".");
        const encoded = dot === -1 ? sessionCookie : sessionCookie.slice(0, dot);
        const decoded = atob(encoded);
        const session = JSON.parse(decoded) as { iat: number };
        const age = Date.now() - session.iat;
        
        if (age <= 8 * 60 * 60 * 1000) {
          const response = NextResponse.next();
          response.headers.set("x-already-authenticated", "1");
          return response;
        }
      } catch {
        // Ignore invalid cookies for the login page notice
      }
    }
    return NextResponse.next();
  }

  // Protect admin paths
  if (ADMIN_PATHS.test(pathname)) {
    const sessionCookie = request.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // Cookie is base64(payload).base64(signature) — extract the payload part
      const dot = sessionCookie.indexOf(".");
      const encoded = dot === -1 ? sessionCookie : sessionCookie.slice(0, dot);
      const decoded = atob(encoded);
      const session = JSON.parse(decoded) as {
        adminId: string;
        role: string;
        email: string;
        name?: string;
        iat: number;
      };

      // Check session age (8 hours)
      const age = Date.now() - session.iat;
      if (age > 8 * 60 * 60 * 1000) {
        const response = NextResponse.redirect(new URL("/admin/login", request.url));
        response.cookies.delete("admin_session");
        return response;
      }

      // Attach role header for downstream server components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-admin-id", session.adminId);
      requestHeaders.set("x-admin-role", session.role);
      requestHeaders.set("x-admin-email", session.email);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};