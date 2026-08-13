import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece /admin/* rotalarını koru
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Login sayfasına her zaman izin ver
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Session'ı yenile ve kullanıcıyı kontrol et
  const response = await updateSession(request);

  // Cookie'lerden session token'ı oku (supabase auth token)
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  if (!hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
